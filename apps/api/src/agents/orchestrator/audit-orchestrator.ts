import {
  computeCategoryScores,
  computeOverallScore,
  scoreIssue,
} from "../../lib/scoring.js";
import { db } from "../../lib/db.js";
import { getStoreSnapshot } from "../../lib/store-snapshot.js";
import type { AuditAgentResult } from "../core/types.js";
import { runAllLensAgents } from "../specialists/lens-agent.js";
import { runRulesAgent } from "../specialists/rules-agent.js";
import { runStrategistAgent } from "../specialists/strategist-agent.js";
import { runTriageAgent } from "../specialists/triage-agent.js";

export async function runAuditOrchestrator(merchantId: string) {
  const store = await getStoreSnapshot(merchantId);

  const [lensResults, rulesIssues] = await Promise.all([
    runAllLensAgents(store),
    Promise.resolve(runRulesAgent(store)),
  ]);

  const lensIssues = lensResults.flatMap((r) => r.issues);
  const candidates = [...lensIssues, ...rulesIssues];

  const triage = await runTriageAgent(store, candidates);
  const insight = await runStrategistAgent(store, triage.issues);

  const scored = triage.issues.map(scoreIssue);
  const overallScore = computeOverallScore(scored);

  const meta: AuditAgentResult["meta"] = {
    lensIssueCount: lensIssues.length,
    rulesIssueCount: rulesIssues.length,
    triageApplied: triage.applied,
  };

  console.info("[audit-orchestrator]", meta);

  return db.audit.create({
    data: {
      merchantId,
      overallScore,
      scores: computeCategoryScores(scored),
      insight,
      issues: {
        create: scored.map(
          ({
            category,
            title,
            description,
            severity,
            confidence,
            effort,
            canAutofix,
            fixSummary,
          }) => ({
            category,
            title,
            description,
            severity,
            confidence,
            effort,
            canAutofix,
            fixSummary,
          })
        ),
      },
    },
    include: { issues: true },
  });
}
