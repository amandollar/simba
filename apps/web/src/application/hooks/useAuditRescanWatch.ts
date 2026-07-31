import { useCallback, useEffect, useRef, useState } from "react";
import { auditsApi } from "@/infrastructure/api";
import type { AuditRescanStatus } from "@/domain/types";

const WATCH_KEY = "simba-watch-rescan";
const POLL_MS = 5_000;
const WATCH_MS = 3 * 60 * 1000;

export function markAuditRescanWatch() {
  sessionStorage.setItem(WATCH_KEY, String(Date.now()));
}

function shouldKeepWatching(
  status: AuditRescanStatus | null,
  watchUntil: number
) {
  if (!status) return Date.now() < watchUntil;
  if (status.status === "scheduled" || status.status === "running") {
    return true;
  }
  return Date.now() < watchUntil;
}

export function useAuditRescanWatch(options: {
  enabled: boolean;
  onUpdated: () => void | Promise<void>;
}) {
  const { enabled, onUpdated } = options;
  const [status, setStatus] = useState<AuditRescanStatus | null>(null);
  const [showUpdated, setShowUpdated] = useState(false);
  const watchUntilRef = useRef(0);
  const handledCompletionRef = useRef<string | null>(null);
  const sawActiveRescanRef = useRef(false);

  const dismissUpdated = useCallback(() => setShowUpdated(false), []);

  useEffect(() => {
    if (!enabled) return;

    const stored = sessionStorage.getItem(WATCH_KEY);
    if (stored) {
      watchUntilRef.current = Number(stored) + WATCH_MS;
    }

    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function poll() {
      try {
        const next = await auditsApi.getRescanStatus();
        if (cancelled) return;

        if (next.status === "scheduled" || next.status === "running") {
          sawActiveRescanRef.current = true;
        }

        setStatus(next);

        const completionKey = next.lastCompletedAt ?? "";
        const watchingFromSession = watchUntilRef.current > Date.now();
        if (
          next.justCompleted &&
          completionKey &&
          handledCompletionRef.current !== completionKey &&
          (sawActiveRescanRef.current || watchingFromSession)
        ) {
          handledCompletionRef.current = completionKey;
          sessionStorage.removeItem(WATCH_KEY);
          watchUntilRef.current = 0;
          await onUpdated();
          if (!cancelled) setShowUpdated(true);
        }

        const watching = shouldKeepWatching(next, watchUntilRef.current);
        if (watching && !interval) {
          interval = setInterval(() => void poll(), POLL_MS);
        }
        if (!watching && interval) {
          clearInterval(interval);
          interval = null;
          if (!next.justCompleted) {
            sessionStorage.removeItem(WATCH_KEY);
          }
        }
      } catch {
        // ignore polling errors
      }
    }

    void poll();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [enabled, onUpdated]);

  const isBackgroundScanning =
    status?.status === "scheduled" || status?.status === "running";

  return {
    status,
    isBackgroundScanning,
    showUpdated,
    dismissUpdated,
  };
}
