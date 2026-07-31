import type { Issue, Product } from "./types";

const PLACEHOLDER_TITLE_RE =
  /^(product\s*name|untitled|new product|test|sample|lorem)/i;

function normalizeTitle(value: string) {
  return value.trim().toLowerCase();
}

export function getAffectedProducts(
  issue: Issue,
  products: Product[]
): Product[] {
  const title = issue.title.toLowerCase();

  if (title.includes("missing alt text")) {
    return products.filter(
      (p) => p.images.length > 0 && !p.altText?.trim()
    );
  }

  if (title.includes("missing images")) {
    return products.filter((p) => p.images.length === 0);
  }

  if (title.includes("missing category")) {
    return products.filter((p) => !p.category?.trim());
  }

  if (title.includes("placeholder title")) {
    return products.filter(
      (p) =>
        PLACEHOLDER_TITLE_RE.test(p.title.trim()) || p.title.trim().length < 3
    );
  }

  if (title.includes("lack detailed descriptions")) {
    return products.filter(
      (p) => !p.description || p.description.trim().length < 40
    );
  }

  if (title.includes("duplicate product titles")) {
    const counts = new Map<string, number>();
    for (const p of products) {
      const key = normalizeTitle(p.title);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return products.filter((p) => (counts.get(normalizeTitle(p.title)) ?? 0) > 1);
  }

  return [];
}

/** Drop truncated inline product lists when we render a full affected list. */
export function formatIssueDescription(
  issue: Issue,
  affectedCount: number
): string {
  if (affectedCount === 0) return issue.description;

  return issue.description
    .replace(/\.\s*(Missing on|Found on|Examples):\s*.+$/i, ".")
    .replace(/\s*…/g, "")
    .trim();
}
