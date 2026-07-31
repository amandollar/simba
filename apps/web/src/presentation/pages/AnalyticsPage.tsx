import { Link } from "react-router-dom";
import { useAnalytics } from "@/application/hooks";
import { formatMoney } from "@/domain/helpers";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import { IconBox, BarChart3 } from "@/presentation/components/ui/Icon";
import { PageHeader } from "@/presentation/components/ui/PageHeader";
import {
  EmptyState,
  ErrorState,
} from "@/presentation/components/ui/States";
import { AnalyticsPageSkeleton } from "@/presentation/components/ui/PageSkeletons";

export function AnalyticsPage() {
  const { data: analytics, loading, error, reload } = useAnalytics();

  if (loading) return <AnalyticsPageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  if (!analytics) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          description="Store performance at a glance"
        />
        <EmptyState
          icon={<IconBox icon={BarChart3} />}
          title="No analytics yet"
          message="Analytics will appear once your store has activity."
        />
      </div>
    );
  }

  const stats = [
    { label: "Revenue", value: formatMoney(analytics.revenue) },
    { label: "Orders", value: String(analytics.orderCount) },
    { label: "Customers", value: String(analytics.customerCount) },
    { label: "Avg. order", value: formatMoney(analytics.avgOrderValue) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Store performance at a glance"
      />

      {analytics.orderCount === 0 ? (
        <EmptyState
          icon={<IconBox icon={BarChart3} />}
          title="No sales data yet"
          message="Share your store link to start tracking revenue and orders."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardBody className="py-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
                    {stat.value}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardBody className="space-y-4">
                <h3 className="text-sm font-medium">Top products</h3>
                {analytics.topProducts.length === 0 ? (
                  <p className="text-sm text-muted">No product sales yet.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {analytics.topProducts.map((product, i) => (
                      <li
                        key={product.id}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {i + 1}. {product.title}
                          </p>
                          <p className="text-xs text-muted">
                            {product.unitsSold} sold
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-medium tabular-nums">
                          {formatMoney(product.revenue)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-4">
                <h3 className="text-sm font-medium">Recent orders</h3>
                <ul className="divide-y divide-border">
                  {analytics.recentOrders.map((order) => (
                    <li key={order.id} className="py-3 first:pt-0 last:pb-0">
                      <Link
                        to={`/orders/${order.id}`}
                        className="flex items-center justify-between gap-3 transition-colors hover:text-foreground"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs text-muted">
                            {order.itemCount} items ·{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm font-medium tabular-nums">
                          {formatMoney(order.total)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardBody className="flex flex-wrap gap-6 text-sm text-muted">
              <span>{analytics.productCount} products</span>
              <span>{analytics.reviewCount} reviews</span>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
