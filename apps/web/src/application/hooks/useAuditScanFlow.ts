import { useCallback, useEffect, useRef, useState } from "react";
import { auditsApi } from "@/infrastructure/api";
import type { AuditRunResult } from "@/domain/types";
import { useRunAudit } from "./useAudit";
import { useAuditScanProgress } from "./useAuditScanProgress";
import { AUDIT_PIPELINE_STEPS } from "@/presentation/components/simba/AuditScanExperience";

export type AuditScanPhase = "idle" | "scanning" | "completing";

const POLL_MS = 2_500;
const COMPLETE_HOLD_MS = 700;

export function useAuditScanFlow(options?: {
  onComplete?: (result: AuditRunResult) => void | Promise<void>;
}) {
  const { mutate: runAudit, error: runError } = useRunAudit();
  const [phase, setPhase] = useState<AuditScanPhase>("idle");
  const [isBackgrounded, setIsBackgrounded] = useState(false);
  const scanStartedAtRef = useRef(0);
  const baselineAuditIdRef = useRef<string | null>(null);
  const finishedRef = useRef(false);

  const isActive = phase !== "idle";
  const { stepIndex, progress, isFinishing } = useAuditScanProgress(
    phase === "scanning"
  );

  const displayProgress = phase === "completing" ? 100 : progress;
  const displayStepIndex =
    phase === "completing"
      ? AUDIT_PIPELINE_STEPS.length - 1
      : stepIndex;

  const completeScan = useCallback(
    async (result: AuditRunResult) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setPhase("completing");
      await new Promise((resolve) => setTimeout(resolve, COMPLETE_HOLD_MS));
      await options?.onComplete?.(result);
      setPhase("idle");
      finishedRef.current = false;
    },
    [options?.onComplete]
  );

  const detectCompletion = useCallback(async (): Promise<AuditRunResult | null> => {
    try {
      const latest = await auditsApi.getLatest();
      if (!latest) return null;

      if (
        baselineAuditIdRef.current &&
        latest.id === baselineAuditIdRef.current
      ) {
        return null;
      }

      const createdAt = new Date(latest.createdAt).getTime();
      if (createdAt < scanStartedAtRef.current - 5_000) {
        return null;
      }

      const diff = await auditsApi.getDiff();
      return { ...latest, diff };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (phase !== "scanning") return;

    const poll = async () => {
      const detected = await detectCompletion();
      if (detected) {
        await completeScan(detected);
      }
    };

    const interval = setInterval(() => void poll(), POLL_MS);

    const onVisibilityChange = () => {
      const hidden = document.visibilityState === "hidden";
      setIsBackgrounded(hidden);
      if (!hidden) void poll();
    };

    setIsBackgrounded(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [phase, detectCompletion, completeScan]);

  const startScan = useCallback(
    async (currentAuditId: string | null): Promise<AuditRunResult | null> => {
      finishedRef.current = false;
      baselineAuditIdRef.current = currentAuditId;
      scanStartedAtRef.current = Date.now();
      setPhase("scanning");

      const result = await runAudit();

      if (finishedRef.current) {
        return result;
      }

      if (result) {
        await completeScan(result);
        return result;
      }

      const detected = await detectCompletion();
      if (detected) {
        await completeScan(detected);
        return detected;
      }

      setPhase("idle");
      return null;
    },
    [runAudit, completeScan, detectCompletion]
  );

  return {
    startScan,
    phase,
    isActive,
    isCompleting: phase === "completing",
    isFinishing: phase === "scanning" && isFinishing,
    stepIndex: displayStepIndex,
    progress: displayProgress,
    isBackgrounded: isActive && isBackgrounded,
    error: runError,
  };
}
