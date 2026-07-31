import { normalizeIssueTitle } from "./audit-diff.js";
import { scoreIssue, type IssueDraft } from "./scoring.js";

const PLACEHOLDER_TITLE_RE =
  /^(product\s*name|untitled|new product|test|sample|lorem)/i;

export function isPlaceholderTitle(title: string) {
  return PLACEHOLDER_TITLE_RE.test(title.trim()) || title.trim().length < 3;
}

export function deduplicateIssues(issues: IssueDraft[]): IssueDraft[] {
  const byKey = new Map<string, IssueDraft>();

  for (const issue of issues) {
    const key = normalizeIssueTitle(issue.title);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, issue);
      continue;
    }

    const existingScore = scoreIssue(existing).priority;
    const candidateScore = scoreIssue(issue).priority;
    if (candidateScore > existingScore) {
      byKey.set(key, issue);
    }
  }

  return [...byKey.values()];
}

export function sanitizeIssue(issue: IssueDraft): IssueDraft {
  return {
    ...issue,
    title: issue.title.trim().slice(0, 200),
    description: issue.description.trim().slice(0, 2000),
    fixSummary: issue.fixSummary?.trim().slice(0, 500) || undefined,
    confidence: Math.max(0, Math.min(1, issue.confidence)),
    canAutofix: Boolean(issue.canAutofix && issue.fixSummary),
  };
}

export function finalizeIssues(issues: IssueDraft[]): IssueDraft[] {
  return deduplicateIssues(issues.map(sanitizeIssue));
}
