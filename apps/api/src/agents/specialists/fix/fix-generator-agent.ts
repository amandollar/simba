import { callChatJSON } from "../../../lib/ai-call.js";
import { buildCompactStoreContext } from "../../../lib/store-context.js";
import type { StoreSnapshot } from "../../../lib/store-snapshot.js";
import { fixProposalSchema } from "../../core/schemas.js";
import type { FixProposal } from "../../core/types.js";

export async function runFixGeneratorAgent(
  issue: {
    title: string;
    description: string;
    category: string;
    fixSummary: string | null;
  },
  store: StoreSnapshot,
  options?: { feedback?: string; productId?: string }
): Promise<FixProposal> {
  const compact = buildCompactStoreContext(store);
  const feedback = options?.feedback;
  const productId = options?.productId;

  const targetProduct = productId
    ? store.products.find((p) => p.id === productId)
    : undefined;

  const feedbackBlock = feedback
    ? `\nVALIDATOR FEEDBACK (address this in your revised fix):\n${feedback}\n`
    : "";

  const targetBlock = targetProduct
    ? `\nTARGET PRODUCT — you MUST fix this product only (use its exact productId):
${JSON.stringify(
  {
    id: targetProduct.id,
    title: targetProduct.title,
    description: targetProduct.description,
    altText: targetProduct.altText,
    category: targetProduct.category,
    imageCount: targetProduct.images.length,
  },
  null,
  2
)}\n`
    : "";

  const prompt = `You are Simba's fix generator agent — an e-commerce copy and catalog specialist.

Given an audit issue and store data, produce a concrete fix the merchant can apply.

Rules:
- If fixable by updating product fields (title, description, altText, category), set canApply true with exact productId and new values.
- Use product IDs exactly as shown in store data.
${targetProduct ? "- You must only change the TARGET PRODUCT listed below." : "- If multiple products are affected, pick the first clear example unless a target product is specified."}
- For category issues, pick clear shopper-friendly names consistent with existing categories.
- Do not suggest values that match existing product data.
- If not auto-fixable (e.g. missing images), set canApply false with clear manual steps.
- recommendation: plain language, 1-3 sentences. Name the product you are fixing.

Return JSON only:
{
  "recommendation": "...",
  "canApply": true,
  "changes": { "productId": "...", "title": "...", ... }
}
${feedbackBlock}${targetBlock}
EXISTING CATEGORIES: ${store.categories.map((c) => c.name).join(", ") || "none"}

ISSUE:
${JSON.stringify(
  {
    title: issue.title,
    description: issue.description,
    category: issue.category,
    fixSummary: issue.fixSummary,
  },
  null,
  2
)}

STORE DATA:
${JSON.stringify(compact, null, 2)}`;

  return callChatJSON({
    messages: [{ role: "user", content: prompt }],
    temperature: feedback ? 0.15 : 0.2,
    timeoutMs: 60_000,
    parse: (data) => fixProposalSchema.parse(data),
  });
}
