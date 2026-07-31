import type { IssueEffort, IssueSeverity } from "./types";

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 } as const;

const SEVERITY_WEIGHT: Record<IssueSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const EFFORT_WEIGHT: Record<IssueEffort, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function computeIssuePriority(issue: {
  severity: IssueSeverity;
  confidence: number;
  effort: IssueEffort;
}) {
  return (
    (SEVERITY_WEIGHT[issue.severity] * 2 + issue.confidence * 2) /
    EFFORT_WEIGHT[issue.effort]
  );
}

export function sortIssuesBySeverity<
  T extends { severity: keyof typeof SEVERITY_ORDER },
>(issues: T[]): T[] {
  return [...issues].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );
}

export function sortIssuesByPriority<
  T extends {
    severity: IssueSeverity;
    confidence: number;
    effort: IssueEffort;
  },
>(issues: T[]): T[] {
  return [...issues].sort(
    (a, b) => computeIssuePriority(b) - computeIssuePriority(a)
  );
}
