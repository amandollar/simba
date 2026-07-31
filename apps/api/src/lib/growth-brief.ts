import type { StoreSnapshot } from "./store-snapshot.js";

export type GrowthStoreStage =
  | "pre_launch"
  | "launched_no_sales"
  | "early_traction"
  | "growing";

export interface GrowthSignal {
  label: string;
  value: string;
  tone: "good" | "warn" | "neutral";
}

export interface GrowthCatalogGap {
  productId: string;
  title: string;
  issues: string[];
}

export interface GrowthCustomerSegment {
  id: string;
  label: string;
  count: number;
  detail: string;
}

export interface GrowthBrief {
  storeStage: GrowthStoreStage;
  stageLabel: string;
  stageDescription: string;
  signals: GrowthSignal[];
  catalogGaps: GrowthCatalogGap[];
  customerSegments: GrowthCustomerSegment[];
  topSeller: { id: string; title: string; unitsSold: number } | null;
  zeroSaleProducts: Array<{ id: string; title: string }>;
  auditBlockers: Array<{ title: string; severity: string; fixSummary: string | null }>;
  reviewGap: { orders: number; reviews: number; productsWithoutReviews: number };
  opportunities: string[];
}

const STAGE_COPY: Record<
  GrowthStoreStage,
  { label: string; description: string }
> = {
  pre_launch: {
    label: "Pre-launch",
    description:
      "Your catalog exists but the storefront isn't live yet. Focus on launch readiness and first impressions.",
  },
  launched_no_sales: {
    label: "Live, no sales yet",
    description:
      "Your store is open but hasn't converted. Fix trust and catalog gaps, then drive your first orders.",
  },
  early_traction: {
    label: "Early traction",
    description:
      "You have sales — now compound them with reviews, repeat buyers, and stronger product pages.",
  },
  growing: {
    label: "Growing",
    description:
      "Revenue is building. Double down on winners, fix catalog leaks, and nurture repeat customers.",
  },
};

function detectStage(store: StoreSnapshot): GrowthStoreStage {
  const { analytics, merchant } = store;
  if (!merchant.launchedAt) return "pre_launch";
  if (analytics.orderCount === 0) return "launched_no_sales";
  if (analytics.orderCount < 10 || analytics.customerCount < 5) {
    return "early_traction";
  }
  return "growing";
}

function productGaps(
  product: StoreSnapshot["products"][number]
): string[] {
  const gaps: string[] = [];
  if (!product.description?.trim()) gaps.push("missing description");
  if (product.images.length === 0) gaps.push("no image");
  if (!product.altText?.trim() && product.images.length > 0) {
    gaps.push("missing alt text");
  }
  if (!product.category?.trim()) gaps.push("uncategorized");
  if (product.description && product.description.length < 60) {
    gaps.push("thin description");
  }
  return gaps;
}

export function buildGrowthBrief(
  store: StoreSnapshot,
  openIssues: Array<{
    title: string;
    severity: string;
    fixSummary: string | null;
  }>,
  auditScore: number | null
): GrowthBrief {
  const { analytics, merchant, products, customers } = store;
  const storeStage = detectStage(store);
  const stage = STAGE_COPY[storeStage];

  const repeatBuyers = customers.filter((c) => c.orderCount > 1).length;
  const oneTimeBuyers = customers.filter((c) => c.orderCount === 1).length;
  const soldProductIds = new Set(
    store.orders.flatMap((o) => o.items.map((i) => i.productId))
  );

  const catalogGaps = products
    .map((p) => ({ productId: p.id, title: p.title, issues: productGaps(p) }))
    .filter((p) => p.issues.length > 0)
    .slice(0, 8);

  const zeroSaleProducts = products
    .filter((p) => !soldProductIds.has(p.id))
    .slice(0, 6)
    .map((p) => ({ id: p.id, title: p.title }));

  const topSeller = analytics.topProducts[0]
    ? {
        id: analytics.topProducts[0].id,
        title: analytics.topProducts[0].title,
        unitsSold: analytics.topProducts[0].unitsSold,
      }
    : null;

  const productsWithReviews = new Set(store.reviews.map((r) => r.productId));
  const productsWithoutReviews = products.filter(
    (p) => !productsWithReviews.has(p.id)
  ).length;

  const signals: GrowthSignal[] = [
    {
      label: "Revenue",
      value: `$${analytics.revenue.toFixed(0)}`,
      tone: analytics.revenue > 0 ? "good" : "neutral",
    },
    {
      label: "Orders",
      value: String(analytics.orderCount),
      tone: analytics.orderCount > 0 ? "good" : "warn",
    },
    {
      label: "Customers",
      value: String(analytics.customerCount),
      tone: analytics.customerCount >= 3 ? "good" : "neutral",
    },
    {
      label: "Reviews",
      value: String(analytics.reviewCount),
      tone:
        analytics.reviewCount === 0 && analytics.orderCount > 0
          ? "warn"
          : analytics.reviewCount > 0
            ? "good"
            : "neutral",
    },
  ];

  if (auditScore !== null) {
    signals.push({
      label: "Health score",
      value: `${auditScore}/100`,
      tone: auditScore >= 70 ? "good" : auditScore >= 45 ? "neutral" : "warn",
    });
  }

  const customerSegments: GrowthCustomerSegment[] = [];

  if (oneTimeBuyers > 0) {
    customerSegments.push({
      id: "one-time",
      label: "One-time buyers",
      count: oneTimeBuyers,
      detail: "Purchased once — prime for a win-back or review ask",
    });
  }
  if (repeatBuyers > 0) {
    customerSegments.push({
      id: "repeat",
      label: "Repeat customers",
      count: repeatBuyers,
      detail: "Came back — reward loyalty or ask for referrals",
    });
  }
  if (customers.length > 0 && analytics.orderCount === 0) {
    customerSegments.push({
      id: "registered",
      label: "Customer records",
      count: customers.length,
      detail: "In your database but no completed orders tracked",
    });
  }

  const opportunities: string[] = [];

  if (!merchant.launchedAt) {
    opportunities.push("Launch the storefront so shoppers can buy");
  }
  if (analytics.orderCount > 0 && analytics.reviewCount === 0) {
    opportunities.push(
      `Request reviews from ${analytics.orderCount} order${analytics.orderCount === 1 ? "" : "s"} — you have zero social proof`
    );
  }
  if (catalogGaps.length > 0) {
    const names = catalogGaps
      .slice(0, 3)
      .map((p) => `"${p.title}"`)
      .join(", ");
    opportunities.push(
      `Fix catalog gaps on ${catalogGaps.length} product${catalogGaps.length === 1 ? "" : "s"} (e.g. ${names})`
    );
  }
  if (zeroSaleProducts.length > 0 && analytics.orderCount > 0) {
    opportunities.push(
      `${zeroSaleProducts.length} product${zeroSaleProducts.length === 1 ? "" : "s"} with no sales yet — ${zeroSaleProducts
        .slice(0, 2)
        .map((p) => `"${p.title}"`)
        .join(", ")}`
    );
  }
  if (oneTimeBuyers >= 2 && repeatBuyers === 0) {
    opportunities.push(
      `Win back ${oneTimeBuyers} one-time buyer${oneTimeBuyers === 1 ? "" : "s"} — no repeat purchases yet`
    );
  }
  if (topSeller && analytics.orderCount >= 3) {
    opportunities.push(
      `Promote bestseller "${topSeller.title}" (${topSeller.unitsSold} sold) — it's your traction driver`
    );
  }
  if (openIssues.length > 0) {
    const urgent = openIssues.filter((i) => i.severity === "critical").length;
    if (urgent > 0) {
      opportunities.push(
        `Resolve ${urgent} urgent audit issue${urgent === 1 ? "" : "s"} blocking conversion`
      );
    }
  }
  if (!merchant.description?.trim()) {
    opportunities.push("Add a store description — shoppers don't know your brand story");
  }

  return {
    storeStage,
    stageLabel: stage.label,
    stageDescription: stage.description,
    signals,
    catalogGaps,
    customerSegments,
    topSeller,
    zeroSaleProducts,
    auditBlockers: openIssues.slice(0, 5).map((i) => ({
      title: i.title,
      severity: i.severity,
      fixSummary: i.fixSummary,
    })),
    reviewGap: {
      orders: analytics.orderCount,
      reviews: analytics.reviewCount,
      productsWithoutReviews,
    },
    opportunities: opportunities.slice(0, 6),
  };
}
