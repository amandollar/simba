import { Link } from "react-router-dom";
import { useMerchant, useOrders } from "@/application/hooks";
import { formatMoney } from "@/domain/helpers";
import { OrderStatusBadge } from "@/presentation/components/ui/Badge";
import { StorefrontLinkActions } from "@/presentation/components/dashboard/StorefrontLinkActions";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import { IconBox, ShoppingCart } from "@/presentation/components/ui/Icon";
import { PageHeader } from "@/presentation/components/ui/PageHeader";
import {
  DataTable,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/presentation/components/ui/DataTable";
import {
  EmptyState,
  ErrorState,
} from "@/presentation/components/ui/States";
import { TablePageSkeleton } from "@/presentation/components/ui/PageSkeletons";
import type { Order } from "@/domain/types";

export function OrdersPage() {
  const { data: merchant } = useMerchant();
  const { data: orders, loading, error, reload } = useOrders();

  if (loading) return <TablePageSkeleton rows={6} columns={4} />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description={`${orders?.length ?? 0} orders from your storefront`}
      />

      {!orders?.length ? (
        <EmptyState
          icon={<IconBox icon={ShoppingCart} />}
          title="No orders yet"
          message="Share your store link to get your first sale."
          action={
            merchant?.slug ? (
              <StorefrontLinkActions slug={merchant.slug} />
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          <div className="hidden md:block">
            <DataTable>
              <DataTableHead>
                <tr>
                  <DataTableHeaderCell>Order</DataTableHeaderCell>
                  <DataTableHeaderCell>Customer</DataTableHeaderCell>
                  <DataTableHeaderCell>Items</DataTableHeaderCell>
                  <DataTableHeaderCell>Total</DataTableHeaderCell>
                  <DataTableHeaderCell>Status</DataTableHeaderCell>
                </tr>
              </DataTableHead>
              <tbody>
                {orders.map((order) => (
                  <DataTableRow key={order.id}>
                    <DataTableCell>
                      <Link
                        to={`/orders/${order.id}`}
                        className="font-medium hover:underline"
                      >
                        #{order.id.slice(0, 8)}
                      </Link>
                      <p className="text-xs text-muted">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </DataTableCell>
                    <DataTableCell>
                      <p>{order.customer?.name}</p>
                      <p className="text-xs text-muted">
                        {order.customer?.email}
                      </p>
                    </DataTableCell>
                    <DataTableCell>
                      <OrderItemsList items={order.items} />
                    </DataTableCell>
                    <DataTableCell className="font-medium">
                      {formatMoney(order.total)}
                    </DataTableCell>
                    <DataTableCell>
                      <OrderStatusBadge status={order.status} />
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </tbody>
            </DataTable>
          </div>
        </>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <Card>
      <CardBody className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              to={`/orders/${order.id}`}
              className="font-medium hover:underline"
            >
              #{order.id.slice(0, 8)}
            </Link>
            <p className="text-xs text-muted">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm">
          {order.customer?.name}{" "}
          <span className="text-muted">({order.customer?.email})</span>
        </p>
        <OrderItemsList items={order.items} />
        <p className="font-semibold">{formatMoney(order.total)}</p>
      </CardBody>
    </Card>
  );
}

function OrderItemsList({
  items,
}: {
  items?: Order["items"];
}) {
  return (
    <ul className="space-y-0.5 text-sm text-muted">
      {items?.map((item) => (
        <li key={item.id}>
          {item.quantity}× {item.product?.title}
        </li>
      ))}
    </ul>
  );
}

