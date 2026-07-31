import type { AuditScores } from "./types";

const DEFAULT_SCORES: AuditScores = {
  ux: 0,
  seo: 0,
  accessibility: 0,
  conversion: 0,
  trust: 0,
};

export function normalizeScores(scores: unknown): AuditScores {
  if (!scores || typeof scores !== "object") return DEFAULT_SCORES;
  const s = scores as Record<string, unknown>;
  return {
    ux: Number(s.ux) || 0,
    seo: Number(s.seo) || 0,
    accessibility: Number(s.accessibility) || 0,
    conversion: Number(s.conversion) || 0,
    trust: Number(s.trust) || 0,
  };
}

export function formatMoney(
  amount: number,
  options?: { maximumFractionDigits?: number }
) {
  const maximumFractionDigits = options?.maximumFractionDigits ?? 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 2,
  }).format(amount);
}

export {
  computeIssuePriority,
  sortIssuesByPriority,
  sortIssuesBySeverity,
} from "./issues";
