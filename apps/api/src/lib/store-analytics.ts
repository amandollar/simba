import { db } from "./db.js";

export interface StoreAnalytics {
  revenue: number;
  orderCount: number;
  customerCount: number;
  productCount: number;
  reviewCount: number;
  avgOrderValue: number;
  topProducts: Array<{
    id: string;
    title: string;
    unitsSold: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: Date;
    itemCount: number;
  }>;
}

export async function computeStoreAnalytics(
  merchantId: string
): Promise<StoreAnalytics> {
  const [orders, productCount, reviewCount, customerCount] = await Promise.all([
    db.order.findMany({
      where: { merchantId },
      include: {
        items: {
          include: { product: { select: { id: true, title: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.product.count({ where: { merchantId } }),
    db.review.count({ where: { product: { merchantId } } }),
    db.customer.count({ where: { merchantId } }),
  ]);

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = orders.length;
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  const productSales = new Map<
    string,
    { id: string; title: string; unitsSold: number; revenue: number }
  >();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = productSales.get(item.productId) ?? {
        id: item.productId,
        title: item.product?.title ?? "Unknown",
        unitsSold: 0,
        revenue: 0,
      };
      existing.unitsSold += item.quantity;
      existing.revenue += item.unitPrice * item.quantity;
      productSales.set(item.productId, existing);
    }
  }

  const topProducts = [...productSales.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    revenue,
    orderCount,
    customerCount,
    productCount,
    reviewCount,
    avgOrderValue,
    topProducts,
    recentOrders: orders.slice(0, 5).map((order) => ({
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
    })),
  };
}
