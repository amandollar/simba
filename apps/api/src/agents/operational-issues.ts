import type { IssueDraft } from "../lib/scoring.js";
import type { StoreSnapshot } from "../lib/store-snapshot.js";

export function detectOperationalIssues(store: StoreSnapshot): IssueDraft[] {
  const issues: IssueDraft[] = [];
  const { merchant, products, analytics, customers } = store;

  if (products.length === 0) {
    issues.push({
      category: "conversion",
      title: "Empty product catalog",
      description:
        "Your store has no products. Shoppers cannot purchase anything until you add at least one product.",
      severity: "critical",
      confidence: 1,
      effort: "medium",
      canAutofix: false,
      fixSummary: "Add products from the Products page",
    });
    return issues;
  }

  if (!merchant.launchedAt) {
    issues.push({
      category: "conversion",
      title: "Store not launched",
      description: `You have ${products.length} product(s) but the storefront is not live. Customers cannot browse or buy until you launch from Store details.`,
      severity: "high",
      confidence: 1,
      effort: "low",
      canAutofix: false,
      fixSummary: "Launch your store from Store details",
    });
  }

  const uncategorized = products.filter((p) => !p.category?.trim());
  if (uncategorized.length > 0) {
    issues.push({
      category: "seo",
      title: `${uncategorized.length} product(s) missing category`,
      description: `Categories power storefront filters and help shoppers browse. ${uncategorized.length} product${uncategorized.length === 1 ? "" : "s"} have no category assigned.`,
      severity:
        uncategorized.length === products.length ? "high" : "medium",
      confidence: 1,
      effort: "low",
      canAutofix: true,
      fixSummary: "Assign a category to each uncategorized product",
    });
  }

  if (merchant.launchedAt && analytics.orderCount === 0) {
    issues.push({
      category: "conversion",
      title: "No sales since launch",
      description:
        "Your store is live but has zero orders. Review product listings, pricing clarity, trust signals, and whether categories/filters make products easy to find.",
      severity: "medium",
      confidence: 0.95,
      effort: "medium",
      canAutofix: false,
    });
  }

  if (analytics.reviewCount === 0 && products.length > 0) {
    issues.push({
      category: "trust",
      title: "No customer reviews",
      description:
        "None of your products have reviews. Social proof strongly influences purchase decisions — encourage buyers to leave feedback after checkout.",
      severity: analytics.orderCount > 0 ? "high" : "medium",
      confidence: 1,
      effort: "medium",
      canAutofix: false,
      fixSummary: "Ask customers to review after purchase",
    });
  }

  const repeatCustomers = customers.filter((c) => c.orderCount > 1).length;
  if (analytics.customerCount >= 3 && repeatCustomers === 0) {
    issues.push({
      category: "trust",
      title: "No repeat customers",
      description: `${analytics.customerCount} customers have ordered but none returned. Consider follow-up emails, loyalty incentives, or improving post-purchase experience.`,
      severity: "medium",
      confidence: 0.85,
      effort: "high",
      canAutofix: false,
    });
  }

  const topIds = new Set(analytics.topProducts.map((p) => p.id));
  const unsoldWithWeakCopy = products.filter(
    (p) =>
      !topIds.has(p.id) &&
      analytics.orderCount > 0 &&
      (!p.description || p.description.length < 40)
  );
  if (unsoldWithWeakCopy.length > 0 && analytics.orderCount >= 2) {
    const title = unsoldWithWeakCopy[0]!.title;
    issues.push({
      category: "conversion",
      title: "Slow sellers lack compelling descriptions",
      description: `Products like "${title}" have weak or missing descriptions while other items sell. Rich copy helps shoppers understand value.`,
      severity: "medium",
      confidence: 0.8,
      effort: "low",
      canAutofix: true,
      fixSummary: `Improve description for "${title}"`,
    });
  }

  return issues;
}
