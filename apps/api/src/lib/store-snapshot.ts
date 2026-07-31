import { db } from "./db.js";
import { computeStoreAnalytics, type StoreAnalytics } from "./store-analytics.js";

export interface StoreSnapshot {
  merchant: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    launchedAt: Date | null;
    branding: unknown;
  };
  products: Array<{
    id: string;
    title: string;
    description: string | null;
    price: number;
    category: string | null;
    images: string[];
    altText: string | null;
  }>;
  orders: Array<{
    id: string;
    customerId: string;
    total: number;
    status: string;
    createdAt: Date;
    items: Array<{
      productId: string;
      productTitle: string;
      productCategory: string | null;
      quantity: number;
      unitPrice: number;
    }>;
  }>;
  customers: Array<{
    id: string;
    name: string;
    email: string;
    orderCount: number;
    totalSpent: number;
    lastOrderAt: Date | null;
  }>;
  reviews: Array<{
    id: string;
    productId: string;
    authorName: string | null;
    rating: number;
    body: string;
  }>;
  categories: Array<{ name: string; productCount: number }>;
  analytics: StoreAnalytics;
}

export async function getStoreSnapshot(
  merchantId: string
): Promise<StoreSnapshot> {
  const merchant = await db.merchant.findUniqueOrThrow({
    where: { id: merchantId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      launchedAt: true,
      branding: true,
    },
  });

  const [products, orders, customers, reviews, analytics] = await Promise.all([
    db.product.findMany({
      where: { merchantId },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        category: true,
        images: true,
        altText: true,
      },
    }),
    db.order.findMany({
      where: { merchantId },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        customerId: true,
        total: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            productId: true,
            quantity: true,
            unitPrice: true,
            product: { select: { title: true, category: true } },
          },
        },
      },
    }),
    db.customer.findMany({
      where: { merchantId },
      select: {
        id: true,
        name: true,
        email: true,
        orders: {
          select: { total: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    db.review.findMany({
      where: { product: { merchantId } },
      select: {
        id: true,
        productId: true,
        authorName: true,
        rating: true,
        body: true,
      },
    }),
    computeStoreAnalytics(merchantId),
  ]);

  const categoryCounts = new Map<string, number>();
  for (const product of products) {
    const name = product.category?.trim();
    if (!name) continue;
    categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
  }

  const categories = [...categoryCounts.entries()]
    .map(([name, productCount]) => ({ name, productCount }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    merchant,
    products,
    orders: orders.map((order) => ({
      id: order.id,
      customerId: order.customerId,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        productId: item.productId,
        productTitle: item.product.title,
        productCategory: item.product.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    })),
    customers: customers
      .map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        orderCount: customer.orders.length,
        totalSpent: customer.orders.reduce((sum, o) => sum + o.total, 0),
        lastOrderAt: customer.orders[0]?.createdAt ?? null,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent),
    reviews,
    categories,
    analytics,
  };
}

export function buildConsultantStoreSummary(store: StoreSnapshot) {
  const uncategorized = store.products.filter((p) => !p.category?.trim()).length;
  const productsWithoutImages = store.products.filter(
    (p) => p.images.length === 0
  ).length;
  const repeatCustomers = store.customers.filter((c) => c.orderCount > 1).length;

  return {
    storeName: store.merchant.name,
    slug: store.merchant.slug,
    description: store.merchant.description,
    isLaunched: Boolean(store.merchant.launchedAt),
    launchedAt: store.merchant.launchedAt,
    productCount: store.products.length,
    uncategorizedProducts: uncategorized,
    productsWithoutImages,
    categories: store.categories,
    analytics: {
      revenue: store.analytics.revenue,
      orderCount: store.analytics.orderCount,
      customerCount: store.analytics.customerCount,
      reviewCount: store.analytics.reviewCount,
      avgOrderValue: store.analytics.avgOrderValue,
      topProducts: store.analytics.topProducts,
    },
    repeatCustomers,
    topCustomers: store.customers.slice(0, 5).map((c) => ({
      name: c.name,
      orderCount: c.orderCount,
      totalSpent: c.totalSpent,
    })),
    recentOrders: store.orders.slice(0, 5).map((o) => ({
      total: o.total,
      status: o.status,
      itemCount: o.items.length,
      createdAt: o.createdAt,
    })),
  };
}
