import { callChatJSON } from "../../lib/ai-call.js";
import { buildCompactStoreContext } from "../../lib/store-context.js";
import type { StoreSnapshot } from "../../lib/store-snapshot.js";
import { copyOptimizationSchema } from "../core/schemas.js";
import type { CopyOptimizationResult } from "../core/types.js";

export async function runCopyAgent(
  product: StoreSnapshot["products"][number],
  store: StoreSnapshot
): Promise<CopyOptimizationResult> {
  const compact = buildCompactStoreContext(store);

  const prompt = `You are Simba's copy agent — an e-commerce copywriter focused on SEO, conversion, and accessibility.

Analyze this product listing and rewrite weak fields. Keep the merchant's brand voice and product facts — do not invent specs, materials, or claims not implied by the current listing.

Optimize for:
- Clear, scannable title (front-load key product terms)
- Description that answers what it is, who it's for, and why buy it
- Alt text that describes the image for screen readers and SEO (if image exists)
- Category that matches existing store categories when possible

Rules:
- Only include fields in "changes" that you actually improve — omit unchanged fields.
- productId must match exactly.
- Do not repeat the current text verbatim.
- copyScore.before reflects current listing quality (1-10); copyScore.after is your proposed quality.
- improvements: 2-5 short bullets explaining what you improved.

Return JSON only:
{
  "summary": "1-2 sentence overview for the merchant",
  "copyScore": { "before": 5, "after": 8 },
  "improvements": ["...", "..."],
  "changes": { "productId": "...", "title": "...", ... }
}

EXISTING CATEGORIES: ${store.categories.map((c) => c.name).join(", ") || "none"}

PRODUCT:
${JSON.stringify(
  {
    id: product.id,
    title: product.title,
    description: product.description,
    altText: product.altText,
    category: product.category,
    price: product.price,
    hasImage: product.images.length > 0,
  },
  null,
  2
)}

STORE CONTEXT:
${JSON.stringify(compact, null, 2)}`;

  return callChatJSON({
    messages: [{ role: "user", content: prompt }],
    temperature: 0.35,
    timeoutMs: 60_000,
    parse: (data) => copyOptimizationSchema.parse(data),
  });
}
