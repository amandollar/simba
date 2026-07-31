import { useEffect, useState } from "react";
import { AUDIT_PIPELINE_STEPS } from "@/presentation/components/simba/AuditScanExperience";

/** Per-step delays — later agents take longer on the server. */
const STEP_DELAYS_MS = [2_000, 4_000, 5_000, 5_000, 5_000, 5_000, 6_000, 8_000];

const MAX_STEP_PROGRESS = 88;
const MAX_CREEP = 10;

export function useAuditScanProgress(running: boolean) {
  const [stepIndex, setStepIndex] = useState(0);
  const [creep, setCreep] = useState(0);

  useEffect(() => {
    if (!running) {
      setStepIndex(0);
      setCreep(0);
      return;
    }

    setStepIndex(0);
    setCreep(0);

    let step = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      if (step >= AUDIT_PIPELINE_STEPS.length - 1) return;
      const delay = STEP_DELAYS_MS[step] ?? 5_000;
      timeout = setTimeout(() => {
        step += 1;
        setStepIndex(step);
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => clearTimeout(timeout);
  }, [running]);

  useEffect(() => {
    if (!running || stepIndex < AUDIT_PIPELINE_STEPS.length - 1) {
      setCreep(0);
      return;
    }

    const interval = setInterval(() => {
      setCreep((value) => Math.min(MAX_CREEP, value + 0.35));
    }, 1_500);

    return () => clearInterval(interval);
  }, [running, stepIndex]);

  const stepProgress =
    ((stepIndex + 1) / AUDIT_PIPELINE_STEPS.length) * MAX_STEP_PROGRESS;
  const progress = Math.min(98, Math.round(stepProgress + creep));
  const isFinishing = stepIndex >= AUDIT_PIPELINE_STEPS.length - 1;

  return { stepIndex, progress, isFinishing };
}
