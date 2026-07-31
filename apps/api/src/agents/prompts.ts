import type { Lens } from "../lib/scoring.js";
import { buildCompactStoreContext } from "../lib/store-context.js";
import type { StoreSnapshot } from "../lib/store-snapshot.js";

const LENS_FOCUS: Record<Lens, string> = {
  ux: "product presentation, category navigation, catalog clarity, and buyer friction on the storefront",
  seo: "titles, descriptions, categories, duplicate content, keyword quality, and discoverability",
  accessibility:
    "alt text, image coverage, readable copy, and inclusive product data",
  conversion:
    "pricing clarity, launch readiness, category filters, trust on listings, and missing info that blocks purchase",
  trust:
    "reviews, customer loyalty signals, product credibility, placeholder content, and professionalism",
};

const LENS_IMPACT: Record<Lens, string> = {
  ux: "hurts conversion when shoppers can't understand or find what they're buying",
  seo: "reduces organic traffic, weakens storefront filters, and hurts click-through",
  accessibility: "excludes customers and risks compliance issues",
  conversion: "directly blocks purchases and increases cart abandonment",
  trust: "makes the store look unprofessional and reduces buyer confidence",
};

const LENS_DATA_HINTS: Record<Lens, string> = {
  ux: "Use categories[], imageCount, and catalog size to assess browse experience.",
  seo: "Flag missing/duplicate/inconsistent categories. Categories appear in storefront filters.",
  accessibility: "Check hasAltText, altText, and imageCount on each product.",
  conversion:
    "Use merchant.launchedAt, analytics (revenue, orderCount, topProducts), and topProductIds.",
  trust:
    "Use reviewCount, customerSummary.repeatBuyers, and product title quality patterns.",
};

export function buildLensPrompt(lens: Lens, store: StoreSnapshot): string {
  const compact = buildCompactStoreContext(store);
  const launched = store.merchant.launchedAt
    ? `Launched ${store.merchant.launchedAt.toISOString().slice(0, 10)}`
    : "NOT LAUNCHED — storefront is hidden from customers";

  return `You are Simba, a senior e-commerce auditor specializing in ${lens.toUpperCase()}.

Analyze this store snapshot and return specific, high-signal issues. Focus on ${LENS_FOCUS[lens]}.

Store status: ${launched}
Sales: ${store.analytics.orderCount} orders, $${store.analytics.revenue.toFixed(2)} revenue, ${store.analytics.customerCount} customers
Categories: ${store.categories.length ? store.categories.map((c) => `${c.name} (${c.productCount})`).join(", ") : "none defined"}

Data hints for this lens: ${LENS_DATA_HINTS[lens]}

Quality bar:
- Only report real problems visible in the data — no generic advice.
- Each issue must cite specific products by title or a clear pattern across products.
- Do NOT duplicate issues already covered by deterministic rules (missing images, alt text, categories, launch status).
- Explain business impact: why this ${LENS_IMPACT[lens]}.
- Prefer fewer, sharper issues over a long vague list (max 5 per lens).
- severity: critical | high | medium | low
- effort: low | medium | high
- confidence: 0.0 to 1.0 (how certain you are based on the data)
- canAutofix: true only if fixable by updating product title, description, altText, or category
- fixSummary: one concrete action when canAutofix is true (required when canAutofix is true)
- category must be "${lens}" for every issue in this response

Return JSON only:
{
  "issues": [
    {
      "category": "${lens}",
      "title": "short issue title",
      "description": "what is wrong, which products, and why it matters for the business",
      "severity": "high",
      "confidence": 0.9,
      "effort": "low",
      "canAutofix": true,
      "fixSummary": "optional fix hint"
    }
  ]
}

STORE DATA:
${JSON.stringify(compact, null, 2)}`;
}
