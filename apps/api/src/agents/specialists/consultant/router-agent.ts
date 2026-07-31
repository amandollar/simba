import { callChatJSON } from "../../../lib/ai-call.js";
import type { ConsultantIntent } from "../../core/types.js";
import { consultantRouterSchema } from "../../core/schemas.js";

export async function routeConsultantIntent(
  message: string
): Promise<{ intent: ConsultantIntent; confidence: number }> {
  const prompt = `You are Simba's router agent. Classify the merchant's question into exactly one intent.

Intents:
- priorities: what to fix first, ranking, top issues, where to start
- sales: revenue, orders, why no sales, customers not buying, AOV
- catalog: products, categories, listings, images, descriptions, inventory quality
- launch: ready to launch, go live, pre-launch checklist, storefront visibility
- audit: explain scores, audit results, what issues mean, Simba scan
- general: greetings, broad help, or unclear questions

Return JSON only:
{
  "intent": "priorities",
  "confidence": 0.9,
  "reasoning": "brief"
}

USER MESSAGE:
${message}`;

  try {
    const parsed = await callChatJSON({
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      parse: (data) => consultantRouterSchema.parse(data),
    });

    return { intent: parsed.intent, confidence: parsed.confidence };
  } catch (err) {
    console.warn(
      "[consultant-router] failed, defaulting to general:",
      err instanceof Error ? err.message : err
    );
    return { intent: "general", confidence: 0 };
  }
}
