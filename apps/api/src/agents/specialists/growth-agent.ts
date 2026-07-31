import { callChatJSON } from "../../lib/ai-call.js";
import type { GrowthBrief } from "../../lib/growth-brief.js";
import type { StoreSnapshot } from "../../lib/store-snapshot.js";
import { growthPlanSchema } from "../core/schemas.js";
import type { GrowthPlan } from "../core/types.js";

export interface GrowthAgentContext {
  store: StoreSnapshot;
  brief: GrowthBrief;
  openIssues: Array<{
    title: string;
    category: string;
    severity: string;
    fixSummary: string | null;
  }>;
  auditScore: number | null;
}

export async function runGrowthAgent(
  context: GrowthAgentContext
): Promise<
  Pick<
    GrowthPlan,
    "headline" | "summary" | "focusThisWeek" | "quickWin" | "actions"
  >
> {
  const { store, brief } = context;
  const storeName = store.merchant.name;

  const prompt = `You are Simba's growth strategist for "${storeName}" — a hands-on advisor, not a generic marketing blog.

The merchant needs a plan grounded in THEIR data below. Every action must feel written for this specific store.

STRICT RULES — violations make the plan useless:
1. Name real products from the data when relevant (use exact titles in quotes).
2. Cite numbers: order counts, revenue, review gaps, customer segments.
3. Each action needs 1-3 evidence bullets — specific facts from GROWTH_BRIEF (not generic advice).
4. NEVER use vague phrases alone like "improve SEO", "boost engagement", "optimize conversion" without naming what and why for THIS store.
5. Match recommendations to storeStage: ${brief.storeStage} (${brief.stageLabel}).
6. If catalogGaps lists products, at least one action must target a named weak listing.
7. If reviewGap.orders > 0 and reviewGap.reviews === 0, include a review-request email with real order count in audience field.
8. productIds: use exact IDs from catalog when an action targets specific products.
9. relatedIssueTitle: copy exact issue title when action fixes an audit finding.
10. emailDraft.body: mention a specific product they bought when possible; use {{customer_name}} and ${storeName} (not {{store_name}}).
11. focusThisWeek: one clear priority sentence naming the #1 lever for this store right now.

Return JSON only:
{
  "headline": "specific to store situation — not 'Grow your business'",
  "summary": "2 sentences referencing real metrics",
  "focusThisWeek": "single priority for the next 7 days",
  "quickWin": "under 15 min, name a specific product/page/action",
  "actions": [
    {
      "id": "kebab-case",
      "title": "specific action title",
      "impact": "high|medium|low",
      "category": "retention|acquisition|conversion|trust|catalog",
      "rationale": "why this matters for THIS store",
      "evidence": ["fact from data", "another fact"],
      "timeframe": "today|this_week|this_month",
      "steps": ["concrete step with product/issue names"],
      "productIds": ["id-if-applicable"],
      "relatedIssueTitle": "exact audit issue if applicable",
      "emailDraft": {
        "subject": "...",
        "body": "...",
        "audience": "e.g. 12 customers who ordered Granite Kit 6",
        "sendWhen": "e.g. 3 days after delivery"
      },
      "inAppAction": "fixes|products|launch|consultant|scan|product_edit"
    }
  ]
}

GROWTH_BRIEF (computed from live data — treat as ground truth):
${JSON.stringify(brief, null, 2)}

PRODUCT ID LOOKUP (use these exact ids in productIds):
${JSON.stringify(
  store.products.slice(0, 20).map((p) => ({ id: p.id, title: p.title })),
  null,
  2
)}

AUDIT SCORE: ${context.auditScore ?? "no scan yet"}

OPEN AUDIT ISSUES:
${JSON.stringify(context.openIssues, null, 2)}`;

  return callChatJSON({
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    timeoutMs: 90_000,
    parse: (data) => growthPlanSchema.parse(data),
  });
}
