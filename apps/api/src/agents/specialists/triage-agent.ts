import { callChatJSON } from "../../lib/ai-call.js";
import { buildCompactStoreContext } from "../../lib/store-context.js";
import { finalizeIssues } from "../../lib/issue-quality.js";
import type { IssueDraft } from "../../lib/scoring.js";
import type { StoreSnapshot } from "../../lib/store-snapshot.js";
import { triageResponseSchema } from "../core/schemas.js";

const MIN_ISSUES_FOR_TRIAGE = 4;

export async function runTriageAgent(
  store: StoreSnapshot,
  candidates: IssueDraft[]
): Promise<{ issues: IssueDraft[]; applied: boolean }> {
  if (candidates.length < MIN_ISSUES_FOR_TRIAGE) {
    return { issues: finalizeIssues(candidates), applied: false };
  }

  const compact = buildCompactStoreContext(store);
  const payload = candidates.map((issue, index) => ({
    id: index,
    ...issue,
  }));

  const prompt = `You are Simba's triage agent — a senior e-commerce QA lead.

You receive candidate issues from multiple specialist auditors (UX, SEO, accessibility, conversion, trust) plus deterministic rule checks.

Your job:
1. Merge semantically duplicate issues (same root problem, different wording) into one stronger issue.
2. Drop vague or low-signal issues that lack specific product/pattern evidence.
3. Keep all high-confidence deterministic issues (missing images, categories, launch blockers, alt text gaps).
4. Adjust severity only when business context clearly warrants it (e.g. zero orders + conversion issue).
5. Preserve canAutofix and fixSummary when merging — prefer the more actionable fix.
6. Return at most 15 issues, highest business impact first.

Do not invent new issues. Only refine the candidate list.

Return JSON only:
{
  "issues": [ same schema as input without id ],
  "droppedCount": 0
}

Each issue schema:
- category: ux | seo | accessibility | conversion | trust
- title, description, severity, confidence, effort, canAutofix, fixSummary (optional)

STORE:
${JSON.stringify(compact, null, 2)}

CANDIDATES:
${JSON.stringify(payload, null, 2)}`;

  try {
    const parsed = await callChatJSON({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      timeoutMs: 60_000,
      parse: (data) => {
        const result = triageResponseSchema.safeParse(data);
        if (!result.success) {
          throw new Error(result.error.message);
        }
        return result.data.issues.map((issue) => ({
          ...issue,
          fixSummary: issue.fixSummary ?? undefined,
        }));
      },
    });

    if (!parsed.length) {
      return { issues: finalizeIssues(candidates), applied: false };
    }

    return { issues: finalizeIssues(parsed), applied: true };
  } catch (err) {
    console.warn(
      "[triage-agent] failed, using deterministic merge:",
      err instanceof Error ? err.message : err
    );
    return { issues: finalizeIssues(candidates), applied: false };
  }
}
