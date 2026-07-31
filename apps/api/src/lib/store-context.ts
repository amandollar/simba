import type { StoreSnapshot } from "./store-snapshot.js";

const MAX_PRODUCTS = 40;
const MAX_DESC = 220;

/** Compact store payload for LLM prompts — avoids token blowups on large catalogs. */
export function buildCompactStoreContext(store: StoreSnapshot) {
  const products = store.products.slice(0, MAX_PRODUCTS).map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description
      ? p.description.length > MAX_DESC
        ? `${p.description.slice(0, MAX_DESC)}…`
        : p.description
      : null,
    price: p.price,
    category: p.category,
    imageCount: p.images.length,
    hasAltText: Boolean(p.altText?.trim()),
    altText: p.altText,
  }));

  return {
    merchant: {
      name: store.merchant.name,
      slug: store.merchant.slug,
      description: store.merchant.description,
      launchedAt: store.merchant.launchedAt,
    },
    productCount: store.products.length,
    productsTruncated: store.products.length > MAX_PRODUCTS,
    products,
    categories: store.categories,
    analytics: store.analytics,
    customerSummary: {
      total: store.customers.length,
      repeatBuyers: store.customers.filter((c) => c.orderCount > 1).length,
      topSpenders: store.customers.slice(0, 5).map((c) => ({
        name: c.name,
        orderCount: c.orderCount,
        totalSpent: c.totalSpent,
      })),
    },
    reviewCount: store.reviews.length,
    recentReviewSample: store.reviews.slice(0, 5).map((r) => ({
      productId: r.productId,
      rating: r.rating,
      body: r.body.slice(0, 120),
    })),
    topProductIds: store.analytics.topProducts.map((p) => p.id),
  };
}
