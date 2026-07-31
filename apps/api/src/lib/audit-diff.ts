import type { Lens } from "./scoring.js";

const LENSES: Lens[] = [
  "ux",
  "seo",
  "accessibility",
  "conversion",
  "trust",
];

export interface DiffIssue {
  title: string;
  category: string;
  severity: string;
}

export interface FixProofRecord {
  id: string;
  issueTitle: string;
  productTitle: string | null;
  changes: Record<string, { before: string | null; after: string }>;
  appliedAt: Date;
}

export interface AuditDiff {
  hasPrevious: boolean;
  previous: {
    id: string;
    overallScore: number;
    createdAt: Date;
  } | null;
  current: {
    id: string;
    overallScore: number;
    createdAt: Date;
  };
  overallDelta: number;
  categoryDeltas: Record<Lens, number>;
  fixedIssues: DiffIssue[];
  newIssues: DiffIssue[];
  recurringIssues: DiffIssue[];
  fixesApplied: FixProofRecord[];
  summary: {
    fixedCount: number;
    newCount: number;
    recurringCount: number;
    fixesAppliedCount: number;
  };
}

type AuditWithIssues = {
  id: string;
  overallScore: number;
  scores: unknown;
  createdAt: Date;
  issues: Array<{
    title: string;
    category: string;
    severity: string;
  }>;
};

export function normalizeIssueTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, " ").trim();
}

export function computeAuditDiff(
  previous: AuditWithIssues,
  current: AuditWithIssues,
  fixesApplied: FixProofRecord[] = []
): AuditDiff {
  const prevMap = new Map(
    previous.issues.map((issue) => [normalizeIssueTitle(issue.title), issue])
  );
  const currMap = new Map(
    current.issues.map((issue) => [normalizeIssueTitle(issue.title), issue])
  );

  const fixedIssues = [...prevMap.entries()]
    .filter(([title]) => !currMap.has(title))
    .map(([, issue]) => issue);

  const newIssues = [...currMap.entries()]
    .filter(([title]) => !prevMap.has(title))
    .map(([, issue]) => issue);

  const recurringIssues = [...currMap.entries()]
    .filter(([title]) => prevMap.has(title))
    .map(([, issue]) => issue);

  const prevScores = (previous.scores ?? {}) as Record<string, number>;
  const currScores = (current.scores ?? {}) as Record<string, number>;

  const categoryDeltas = LENSES.reduce(
    (acc, lens) => {
      acc[lens] = (currScores[lens] ?? 0) - (prevScores[lens] ?? 0);
      return acc;
    },
    {} as Record<Lens, number>
  );

  return {
    hasPrevious: true,
    previous: {
      id: previous.id,
      overallScore: previous.overallScore,
      createdAt: previous.createdAt,
    },
    current: {
      id: current.id,
      overallScore: current.overallScore,
      createdAt: current.createdAt,
    },
    overallDelta: current.overallScore - previous.overallScore,
    categoryDeltas,
    fixedIssues,
    newIssues,
    recurringIssues,
    fixesApplied,
    summary: {
      fixedCount: fixedIssues.length,
      newCount: newIssues.length,
      recurringCount: recurringIssues.length,
      fixesAppliedCount: fixesApplied.length,
    },
  };
}

export function noPreviousDiff(current: AuditWithIssues): AuditDiff {
  const emptyScores = LENSES.reduce(
    (acc, lens) => {
      acc[lens] = 0;
      return acc;
    },
    {} as Record<Lens, number>
  );

  return {
    hasPrevious: false,
    previous: null,
    current: {
      id: current.id,
      overallScore: current.overallScore,
      createdAt: current.createdAt,
    },
    overallDelta: 0,
    categoryDeltas: emptyScores,
    fixedIssues: [],
    newIssues: current.issues,
    recurringIssues: [],
    fixesApplied: [],
    summary: {
      fixedCount: 0,
      newCount: current.issues.length,
      recurringCount: 0,
      fixesAppliedCount: 0,
    },
  };
}

export function serializeFixProof(
  row: {
    id: string;
    issueTitle: string;
    productTitle: string | null;
    changes: unknown;
    appliedAt: Date;
  }
): FixProofRecord {
  return {
    id: row.id,
    issueTitle: row.issueTitle,
    productTitle: row.productTitle,
    changes: row.changes as Record<
      string,
      { before: string | null; after: string }
    >,
    appliedAt: row.appliedAt,
  };
}
