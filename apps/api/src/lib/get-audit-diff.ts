import { db } from "./db.js";
import {
  computeAuditDiff,
  noPreviousDiff,
  serializeFixProof,
  type AuditDiff,
} from "./audit-diff.js";

async function loadAuditPair(merchantId: string, auditId?: string) {
  if (auditId) {
    const current = await db.audit.findFirst({
      where: { id: auditId, merchantId },
      include: {
        issues: {
          select: { title: true, category: true, severity: true },
        },
      },
    });
    if (!current) return null;

    const previous = await db.audit.findFirst({
      where: {
        merchantId,
        createdAt: { lt: current.createdAt },
      },
      orderBy: { createdAt: "desc" },
      include: {
        issues: {
          select: { title: true, category: true, severity: true },
        },
      },
    });

    return { current, previous };
  }

  const audits = await db.audit.findMany({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
    take: 2,
    include: {
      issues: {
        select: { title: true, category: true, severity: true },
      },
    },
  });

  const current = audits[0];
  if (!current) return null;
  return { current, previous: audits[1] ?? null };
}

async function loadFixesBetween(
  merchantId: string,
  after: Date | null,
  before: Date
) {
  const fixes = await db.fixApplication.findMany({
    where: {
      merchantId,
      appliedAt: {
        ...(after ? { gt: after } : {}),
        lte: before,
      },
    },
    orderBy: { appliedAt: "desc" },
  });

  return fixes.map(serializeFixProof);
}

export async function getAuditDiff(
  merchantId: string,
  auditId?: string
): Promise<AuditDiff | null> {
  const pair = await loadAuditPair(merchantId, auditId);
  if (!pair) return null;

  const { current, previous } = pair;

  if (!previous) {
    return noPreviousDiff(current);
  }

  const fixesApplied = await loadFixesBetween(
    merchantId,
    previous.createdAt,
    current.createdAt
  );

  return computeAuditDiff(previous, current, fixesApplied);
}

export async function getAuditHistoryWithSummaries(merchantId: string) {
  const [audits, fixes] = await Promise.all([
    db.audit.findMany({
      where: { merchantId },
      orderBy: { createdAt: "desc" },
      include: {
        issues: {
          select: { title: true, category: true, severity: true },
        },
      },
    }),
    db.fixApplication.findMany({
      where: { merchantId },
      orderBy: { appliedAt: "desc" },
    }),
  ]);

  return audits.map((audit, index) => {
    const previous = audits[index + 1];
    const { issues, ...summary } = audit;

    if (!previous) {
      return {
        id: summary.id,
        overallScore: summary.overallScore,
        scores: summary.scores,
        createdAt: summary.createdAt,
        diffSummary: null,
      };
    }

    const fixesBetween = fixes
      .filter(
        (fix) =>
          fix.appliedAt > previous.createdAt &&
          fix.appliedAt <= audit.createdAt
      )
      .map(serializeFixProof);

    const diff = computeAuditDiff(previous, audit, fixesBetween);

    return {
      id: summary.id,
      overallScore: summary.overallScore,
      scores: summary.scores,
      createdAt: summary.createdAt,
      diffSummary: {
        overallDelta: diff.overallDelta,
        fixedCount: diff.summary.fixedCount,
        newCount: diff.summary.newCount,
        recurringCount: diff.summary.recurringCount,
        fixesAppliedCount: diff.summary.fixesAppliedCount,
      },
    };
  });
}
