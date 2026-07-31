import type { IssueDraft } from "./scoring.js";
import type { StoreSnapshot } from "./store-snapshot.js";
import { isPlaceholderTitle } from "./issue-quality.js";

export function detectCatalogIssues(store: StoreSnapshot): IssueDraft[] {
  const issues: IssueDraft[] = [];
  const { products, merchant } = store;

  if (products.length === 0) return issues;

  const noImages = products.filter((p) => p.images.length === 0);
  if (noImages.length > 0) {
    issues.push({
      category: "ux",
      title: `${noImages.length} product(s) missing images`,
      description: `Shoppers rely on visuals to evaluate products. ${noImages.length} product${noImages.length === 1 ? "" : "s"} have no photos.`,
      severity: noImages.length === products.length ? "critical" : "high",
      confidence: 1,
      effort: "medium",
      canAutofix: false,
      fixSummary: "Upload product photos from the Products page",
    });
  }

  const missingAlt = products.filter(
    (p) => p.images.length > 0 && !p.altText?.trim()
  );
  if (missingAlt.length > 0) {
    issues.push({
      category: "accessibility",
      title: `${missingAlt.length} product(s) missing alt text`,
      description: `Alt text helps screen readers and SEO. ${missingAlt.length} product${missingAlt.length === 1 ? " needs" : "s need"} descriptive alt text.`,
      severity: missingAlt.length >= 3 ? "high" : "medium",
      confidence: 1,
      effort: "low",
      canAutofix: true,
      fixSummary: "Add descriptive alt text for each product image",
    });
  }

  const placeholders = products.filter((p) => isPlaceholderTitle(p.title));
  if (placeholders.length > 0) {
    issues.push({
      category: "trust",
      title: `${placeholders.length} product(s) have placeholder titles`,
      description: `Generic titles like "Product Name" hurt credibility. ${placeholders.length} product${placeholders.length === 1 ? "" : "s"} still use placeholder names.`,
      severity: "high",
      confidence: 1,
      effort: "low",
      canAutofix: true,
      fixSummary: "Replace placeholder titles with specific product names",
    });
  }

  const titleCounts = new Map<string, number>();
  for (const p of products) {
    const key = p.title.trim().toLowerCase();
    titleCounts.set(key, (titleCounts.get(key) ?? 0) + 1);
  }
  const duplicateTitles = [...titleCounts.entries()].filter(([, n]) => n > 1);
  if (duplicateTitles.length > 0) {
    issues.push({
      category: "seo",
      title: "Duplicate product titles detected",
      description: `Duplicate titles confuse shoppers and search engines. Examples: ${duplicateTitles
        .slice(0, 2)
        .map(([t]) => t)
        .join(", ")}.`,
      severity: "medium",
      confidence: 1,
      effort: "low",
      canAutofix: true,
      fixSummary: "Give each product a unique, descriptive title",
    });
  }

  const thinDescriptions = products.filter(
    (p) => !p.description || p.description.trim().length < 40
  );
  if (thinDescriptions.length >= 2) {
    issues.push({
      category: "conversion",
      title: `${thinDescriptions.length} product(s) lack detailed descriptions`,
      description:
        "Short or missing descriptions make it harder for shoppers to understand value and buy with confidence.",
      severity: thinDescriptions.length === products.length ? "high" : "medium",
      confidence: 0.95,
      effort: "low",
      canAutofix: true,
      fixSummary: "Expand product descriptions with benefits and specs",
    });
  }

  if (!merchant.description?.trim()) {
    issues.push({
      category: "trust",
      title: "Store description is empty",
      description:
        "Your storefront hero and SEO benefit from a clear store description explaining what you sell and who it's for.",
      severity: "medium",
      confidence: 1,
      effort: "low",
      canAutofix: false,
      fixSummary: "Add a store description in Store details",
    });
  }

  return issues;
}
