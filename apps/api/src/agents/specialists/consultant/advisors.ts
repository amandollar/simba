import { callChatText } from "../../../lib/ai-call.js";
import type { ConsultantContext, ConsultantIntent } from "../../core/types.js";

const BASE_RULES = `Rules:
- Ground answers ONLY in the provided data. Do not invent products, metrics, or issues.
- Reference issues by exact title when relevant.
- Be concise, direct, and actionable — like a great PM briefing a founder.
- Use markdown: **bold** for emphasis, bullet lists for recommendations.
- Keep responses under 250 words unless the user asks for detail.
- Never claim you changed data — autofix happens in the Issues UI.`;

const SPECIALIST_FOCUS: Record<ConsultantIntent, string> = {
  priorities: `You are Simba's **Priority advisor**. Focus on ranked fixes: severity, effort, autofix availability, and business impact. Give a clear numbered plan (max 5 steps).`,
  sales: `You are Simba's **Sales advisor**. Focus on orders, revenue, top products, customer repeat rate, and how catalog/trust issues may block purchases.`,
  catalog: `You are Simba's **Catalog advisor**. Focus on product data quality: titles, descriptions, images, categories, alt text, and listing clarity.`,
  launch: `You are Simba's **Launch advisor**. Focus on launch readiness: catalog completeness, blockers, and what to fix before going live.`,
  audit: `You are Simba's **Audit advisor**. Explain scores, issue categories, and what the latest scan means in plain language.`,
  general: `You are **Simba**, a senior e-commerce consultant. Answer holistically using audit, store, and fix data.`,
};

function buildContextBlock(ctx: ConsultantContext) {
  return JSON.stringify(
    {
      audit: ctx.audit,
      store: ctx.storeSummary,
      recentFixes: ctx.recentFixes,
    },
    null,
    2
  );
}

export async function runConsultantAdvisor(
  intent: ConsultantIntent,
  ctx: ConsultantContext
): Promise<string> {
  const systemPrompt = `${SPECIALIST_FOCUS[intent]}

${BASE_RULES}

CONTEXT:
${buildContextBlock(ctx)}`;

  return callChatText({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: ctx.message },
    ],
    temperature: intent === "priorities" ? 0.2 : 0.3,
  });
}

export function buildNoAuditReply(ctx: ConsultantContext): string {
  const { storeSummary } = ctx;
  const launchHint = storeSummary.isLaunched
    ? ""
    : " Your store isn't launched yet — fix catalog issues first, then launch from Store details.";

  return `You haven't run an audit yet. Go to **Simba → Overview** and click **Run audit** — then I can give specific recommendations.${launchHint}

Quick snapshot: **${storeSummary.productCount}** products, **${storeSummary.analytics.orderCount}** orders, **${storeSummary.categories.length}** categories.`;
}

export function buildConsultantFallback(
  ctx: ConsultantContext,
  intent: ConsultantIntent
): string {
  const top = ctx.audit?.topIssues[0];
  if (!top) {
    return "I'm having trouble reaching the AI right now. Your audit data is saved — please try again in a moment.";
  }

  const focus =
    intent === "sales"
      ? `You have **${ctx.storeSummary.analytics.orderCount}** orders.`
      : intent === "launch" && !ctx.storeSummary.isLaunched
        ? "Your store isn't launched yet."
        : `Start with **${top.title}** (${top.severity} severity).`;

  return `I'm having trouble reaching the AI right now. ${focus} Re-run the audit after fixing it, or try again in a moment.`;
}
