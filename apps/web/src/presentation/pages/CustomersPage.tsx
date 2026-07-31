import { useCustomers } from "@/application/hooks";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import { IconBox, Users } from "@/presentation/components/ui/Icon";
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
import { formatMoney } from "@/domain/helpers";
import type { Customer } from "@/domain/types";

export function CustomersPage() {
  const { data: customers, loading, error, reload } = useCustomers();

  if (loading) return <TablePageSkeleton rows={6} columns={4} />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description={`${customers?.length ?? 0} people who bought from your store`}
      />

      {!customers?.length ? (
        <EmptyState
          icon={<IconBox icon={Users} />}
          title="No customers yet"
          message="Customers appear here after their first order."
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {customers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
          <div className="hidden md:block">
            <DataTable>
              <DataTableHead>
                <tr>
                  <DataTableHeaderCell>Customer</DataTableHeaderCell>
                  <DataTableHeaderCell>Orders</DataTableHeaderCell>
                  <DataTableHeaderCell>Total spent</DataTableHeaderCell>
                  <DataTableHeaderCell>Last order</DataTableHeaderCell>
                </tr>
              </DataTableHead>
              <tbody>
                {customers.map((customer) => (
                  <DataTableRow key={customer.id}>
                    <DataTableCell>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-xs text-muted">{customer.email}</p>
                    </DataTableCell>
                    <DataTableCell>{customer.orderCount ?? 0}</DataTableCell>
                    <DataTableCell className="font-medium">
                      {formatMoney(customer.totalSpent ?? 0)}
                    </DataTableCell>
                    <DataTableCell className="text-muted">
                      {customer.lastOrderAt
                        ? new Date(customer.lastOrderAt).toLocaleDateString()
                        : "—"}
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

function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <Card>
      <CardBody className="space-y-2">
        <p className="font-medium">{customer.name}</p>
        <p className="text-sm text-muted">{customer.email}</p>
        <div className="flex gap-4 text-sm">
          <span>{customer.orderCount ?? 0} orders</span>
          <span className="font-medium">
            {formatMoney(customer.totalSpent ?? 0)}
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
