import { serializeFixProof } from "../../lib/audit-diff.js";
import { db } from "../../lib/db.js";
import { scoreIssue } from "../../lib/scoring.js";
import {
  buildConsultantStoreSummary,
  getStoreSnapshot,
} from "../../lib/store-snapshot.js";
import {
  CONSULTANT_SPECIALIST_LABELS,
  type ConsultantIntent,
  type ConsultantResponse,
} from "../core/types.js";
import {
  buildConsultantFallback,
  buildNoAuditReply,
  runConsultantAdvisor,
} from "../specialists/consultant/advisors.js";
import { routeConsultantIntent } from "../specialists/consultant/router-agent.js";

const MAX_MESSAGE_LENGTH = 2000;

function trimMessage(message: string) {
  return message.trim().slice(0, MAX_MESSAGE_LENGTH);
}

export async function runConsultantOrchestrator(
  merchantId: string,
  message: string
): Promise<ConsultantResponse> {
  const safeMessage = trimMessage(message);
  if (!safeMessage) {
    return { reply: "Please enter a question about your store or audit.", specialist: "general" };
  }

  const [latestAudit, store, recentFixes] = await Promise.all([
    db.audit.findFirst({
      where: { merchantId },
      orderBy: { createdAt: "desc" },
      include: { issues: true },
    }),
    getStoreSnapshot(merchantId),
    db.fixApplication.findMany({
      where: { merchantId },
      orderBy: { appliedAt: "desc" },
      take: 5,
    }),
  ]);

  const storeSummary = buildConsultantStoreSummary(store);

  if (!latestAudit) {
    return {
      reply: buildNoAuditReply({
        message: safeMessage,
        store,
        storeSummary,
        audit: null,
        recentFixes: [],
      }),
      specialist: "general",
    };
  }

  const openIssues = latestAudit.issues
    .filter((i) => i.status === "open")
    .map((issue) => {
      const scored = scoreIssue({
        category: issue.category as
          | "ux"
          | "seo"
          | "accessibility"
          | "conversion"
          | "trust",
        title: issue.title,
        description: issue.description,
        severity: issue.severity as "critical" | "high" | "medium" | "low",
        confidence: issue.confidence,
        effort: issue.effort as "low" | "medium" | "high",
        canAutofix: issue.canAutofix,
        fixSummary: issue.fixSummary ?? undefined,
      });
      return {
        title: issue.title,
        category: issue.category,
        severity: issue.severity,
        effort: issue.effort,
        canAutofix: issue.canAutofix,
        fixSummary: issue.fixSummary,
        description: issue.description,
        priority: Number(scored.priority.toFixed(2)),
      };
    })
    .sort((a, b) => b.priority - a.priority);

  const ctx = {
    message: safeMessage,
    store,
    storeSummary,
    audit: {
      overallScore: latestAudit.overallScore,
      scores: latestAudit.scores,
      auditedAt: latestAudit.createdAt,
      insight: latestAudit.insight,
      openIssueCount: openIssues.length,
      resolvedCount: latestAudit.issues.filter((i) => i.status === "resolved")
        .length,
      dismissedCount: latestAudit.issues.filter((i) => i.status === "dismissed")
        .length,
      topIssues: openIssues.slice(0, 10),
    },
    recentFixes: recentFixes.map(serializeFixProof),
  };

  const { intent, confidence } = await routeConsultantIntent(safeMessage);
  const specialist: ConsultantIntent =
    confidence < 0.45 && intent !== "priorities" ? "general" : intent;

  console.info("[consultant-orchestrator]", {
    intent,
    specialist,
    confidence,
    label: CONSULTANT_SPECIALIST_LABELS[specialist],
  });

  try {
    const reply = await runConsultantAdvisor(specialist, ctx);
    return { reply, specialist };
  } catch (err) {
    console.error("[consultant-orchestrator] advisor failed:", err);
    return {
      reply: buildConsultantFallback(ctx, specialist),
      specialist,
    };
  }
}
