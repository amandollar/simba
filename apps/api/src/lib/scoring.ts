export type Severity = "critical" | "high" | "medium" | "low";
export type Effort = "low" | "medium" | "high";
export type Lens = "ux" | "seo" | "accessibility" | "conversion" | "trust";

export interface IssueDraft {
  category: Lens;
  title: string;
  description: string;
  severity: Severity;
  confidence: number;
  effort: Effort;
  canAutofix: boolean;
  fixSummary?: string;
}

export interface ScoredIssue extends IssueDraft {
  priority: number;
}

const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const EFFORT_WEIGHT: Record<Effort, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function scoreIssue(issue: IssueDraft): ScoredIssue {
  const priority =
    (SEVERITY_WEIGHT[issue.severity] * 2 + issue.confidence * 2) /
    EFFORT_WEIGHT[issue.effort];

  return { ...issue, priority };
}

export function computeOverallScore(issues: ScoredIssue[]): number {
  if (issues.length === 0) return 100;

  const penalty = issues.reduce((sum, issue) => {
    const weight = SEVERITY_WEIGHT[issue.severity];
    return sum + weight * issue.confidence;
  }, 0);

  const maxPenalty = issues.length * 4;
  const score = Math.round(100 - (penalty / maxPenalty) * 100);
  return Math.max(0, Math.min(100, score));
}

export function computeCategoryScores(
  issues: ScoredIssue[]
): Record<Lens, number> {
  const lenses: Lens[] = [
    "ux",
    "seo",
    "accessibility",
    "conversion",
    "trust",
  ];

  return lenses.reduce(
    (acc, lens) => {
      const categoryIssues = issues.filter((i) => i.category === lens);
      acc[lens] = computeOverallScore(categoryIssues);
      return acc;
    },
    {} as Record<Lens, number>
  );
}
