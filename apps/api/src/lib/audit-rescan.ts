import { runFullAudit } from "../agents/analyze.js";

export type RescanPriority = "priority" | "normal";

export type RescanStatus = "idle" | "scheduled" | "running";

export interface AuditRescanStatus {
  status: RescanStatus;
  reason?: string;
  startsInMs?: number;
  justCompleted: boolean;
  lastCompletedAt: string | null;
}

const DEBOUNCE_MS: Record<RescanPriority, number> = {
  priority: 8_000,
  normal: 60_000,
};

const MIN_GAP_MS = 2 * 60 * 1000;
const JUST_COMPLETED_MS = 45_000;

const pendingTimers = new Map<string, NodeJS.Timeout>();
const lastCompletedAt = new Map<string, number>();
const inFlight = new Set<string>();

interface MerchantRescanState {
  status: RescanStatus;
  reason?: string;
  runAt?: number;
}

const merchantState = new Map<string, MerchantRescanState>();

function setMerchantState(merchantId: string, state: MerchantRescanState) {
  merchantState.set(merchantId, state);
}

export function getAuditRescanStatus(merchantId: string): AuditRescanStatus {
  const state = merchantState.get(merchantId);
  const completedAt = lastCompletedAt.get(merchantId);
  const justCompleted = completedAt
    ? Date.now() - completedAt < JUST_COMPLETED_MS
    : false;

  if (!state || state.status === "idle") {
    return {
      status: "idle",
      justCompleted,
      lastCompletedAt: completedAt
        ? new Date(completedAt).toISOString()
        : null,
    };
  }

  return {
    status: state.status,
    reason: state.reason,
    startsInMs:
      state.status === "scheduled" && state.runAt
        ? Math.max(0, state.runAt - Date.now())
        : undefined,
    justCompleted,
    lastCompletedAt: completedAt
      ? new Date(completedAt).toISOString()
      : null,
  };
}

export function scheduleAuditRescan(
  merchantId: string,
  reason: string,
  priority: RescanPriority = "normal"
) {
  const existing = pendingTimers.get(merchantId);
  if (existing) {
    clearTimeout(existing);
  }

  const delay = DEBOUNCE_MS[priority];
  const runAt = Date.now() + delay;

  setMerchantState(merchantId, {
    status: "scheduled",
    reason,
    runAt,
  });

  const timer = setTimeout(() => {
    pendingTimers.delete(merchantId);
    void executeAuditRescan(merchantId, reason);
  }, delay);

  pendingTimers.set(merchantId, timer);

  console.info("[audit-rescan] scheduled", {
    merchantId,
    reason,
    priority,
    delayMs: delay,
  });
}

async function executeAuditRescan(merchantId: string, reason: string) {
  if (inFlight.has(merchantId)) {
    scheduleAuditRescan(merchantId, `${reason}-retry`, "priority");
    return;
  }

  const lastRun = lastCompletedAt.get(merchantId) ?? 0;
  const elapsed = Date.now() - lastRun;
  if (elapsed < MIN_GAP_MS) {
    const wait = MIN_GAP_MS - elapsed;
    console.info("[audit-rescan] throttled, retrying in", wait, "ms");
    setMerchantState(merchantId, {
      status: "scheduled",
      reason,
      runAt: Date.now() + wait,
    });
    setTimeout(() => {
      void executeAuditRescan(merchantId, reason);
    }, wait);
    return;
  }

  inFlight.add(merchantId);
  setMerchantState(merchantId, { status: "running", reason });

  try {
    console.info("[audit-rescan] running", { merchantId, reason });
    await runFullAudit(merchantId);
    lastCompletedAt.set(merchantId, Date.now());
    console.info("[audit-rescan] complete", { merchantId });
  } catch (err) {
    console.error("[audit-rescan] failed:", err);
  } finally {
    inFlight.delete(merchantId);
    setMerchantState(merchantId, { status: "idle" });
  }
}
