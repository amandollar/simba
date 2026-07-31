import { callChatJSON } from "../../lib/ai-call.js";
import { scoreIssue, type IssueDraft } from "../../lib/scoring.js";
import type { StoreSnapshot } from "../../lib/store-snapshot.js";
import { strategistResponseSchema } from "../core/schemas.js";

export async function runStrategistAgent(
  store: StoreSnapshot,
  issues: IssueDraft[]
): Promise<string | null> {
  const open = [...issues]
    .map((issue) => ({ issue, priority: scoreIssue(issue).priority }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);

  const prompt = `You are Simba's strategist agent — you write one plain-language insight for a store owner.

Given the store snapshot and top prioritized issues, write ONE sentence (max 35 words) telling the merchant what matters most right now.

Rules:
- Plain language, no jargon (avoid "SEO", "conversion funnel" unless necessary)
- Reference the #1 issue by title when issues exist
- If no issues, congratulate briefly and suggest re-scanning after changes
- If store not launched, mention launch when relevant
- No markdown, no bullet points — single sentence only

Return JSON only: { "insight": "..." }

STORE: ${store.merchant.name} — ${store.products.length} products, ${store.analytics.orderCount} orders, launched: ${store.merchant.launchedAt ? "yes" : "no"}

TOP ISSUES:
${JSON.stringify(
  open.map(({ issue }) => ({
    title: issue.title,
    severity: issue.severity,
    fixSummary: issue.fixSummary,
  })),
  null,
  2
)}`;

  try {
    const parsed = await callChatJSON({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      parse: (data) => strategistResponseSchema.parse(data),
    });

    return parsed.insight.trim();
  } catch (err) {
    console.warn(
      "[strategist-agent] failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
