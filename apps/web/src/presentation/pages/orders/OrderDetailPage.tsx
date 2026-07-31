import { Link, useParams } from "react-router-dom";
import { useOrder } from "@/application/hooks";
import { cloudinaryImageUrl } from "@/domain/cloudinary";
import { formatMoney } from "@/domain/helpers";
import { OrderStatusBadge } from "@/presentation/components/ui/Badge";
import { Button } from "@/presentation/components/ui/Button";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import { Icon, ArrowLeft, Package } from "@/presentation/components/ui/Icon";
import { PageHeader } from "@/presentation/components/ui/PageHeader";
import { ErrorState } from "@/presentation/components/ui/States";
import { OrderDetailSkeleton } from "@/presentation/components/ui/PageSkeletons";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, loading, error, reload } = useOrder(id);

  if (loading) return <OrderDetailSkeleton />;
  if (error || !order) {
    return <ErrorState message={error ?? "Order not found"} onRetry={reload} />;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <Icon icon={ArrowLeft} size={16} />
        Back to orders
      </Link>

      <PageHeader
        title={`Order #${order.id.slice(0, 8).toUpperCase()}`}
        description={new Date(order.createdAt).toLocaleString()}
        action={<OrderStatusBadge status={order.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardBody className="space-y-4">
            <h3 className="text-sm font-medium">Items</h3>
            <ul className="divide-y divide-border">
              {order.items?.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  {item.product?.images?.[0] ? (
                    <img
                      src={cloudinaryImageUrl(item.product.images[0], {
                        width: 80,
                        height: 80,
                      })}
                      alt=""
                      className="h-16 w-16 rounded-lg border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-surface-overlay">
                      <Icon icon={Package} size={20} className="text-muted" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.product?.title}</p>
                    {item.product?.category && (
                      <p className="text-xs text-muted">{item.product.category}</p>
                    )}
                    <p className="mt-1 text-sm text-muted">
                      {item.quantity} × {formatMoney(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-medium tabular-nums">
                    {formatMoney(item.unitPrice * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-3">
              <h3 className="text-sm font-medium">Customer</h3>
              <p className="text-sm font-medium">{order.customer?.name}</p>
              <p className="text-sm text-muted">{order.customer?.email}</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium tabular-nums">
                  {formatMoney(order.total)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatMoney(order.total)}</span>
              </div>
            </CardBody>
          </Card>

          <Link to="/orders">
            <Button variant="secondary" className="w-full">
              All orders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
