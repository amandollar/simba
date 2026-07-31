import { useState } from "react";
import { Link } from "react-router-dom";
import { useDeleteProduct, useProducts } from "@/application/hooks";
import { cloudinaryImageUrl } from "@/domain/cloudinary";
import { formatMoney } from "@/domain/helpers";
import { IconBox, Package } from "@/presentation/components/ui/Icon";
import { Button } from "@/presentation/components/ui/Button";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import { ConfirmDialog } from "@/presentation/components/ui/ConfirmDialog";
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
  Banner,
} from "@/presentation/components/ui/States";
import { TablePageSkeleton } from "@/presentation/components/ui/PageSkeletons";
import type { Product } from "@/domain/types";

export function ProductsPage() {
  const { data: products, loading, error, reload } = useProducts();
  const { mutate: remove, loading: deleting, error: deleteError } =
    useDeleteProduct(reload);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  async function confirmDelete() {
    if (!deleteTarget) return;
    const result = await remove(deleteTarget.id);
    if (result) setDeleteTarget(null);
  }

  if (loading) return <TablePageSkeleton rows={6} columns={4} withThumb />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be removed permanently.`
            : undefined
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {deleteError && (
        <Banner variant="error">{deleteError}</Banner>
      )}

      <PageHeader
        title="Products"
        description={`${products?.length ?? 0} products in your catalog`}
        action={
          <Link to="/products/new">
            <Button variant="primary">Add product</Button>
          </Link>
        }
      />

      {!products?.length ? (
        <EmptyState
          icon={<IconBox icon={Package} />}
          title="No products yet"
          message="Add your first product to start selling and get audited by Simba AI."
          action={
            <Link to="/products/new">
              <Button variant="primary">Add product</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {products.map((p) => (
              <Card key={p.id}>
                <CardBody className="flex gap-3">
                  <ProductThumb product={p} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="text-sm font-semibold">
                      {formatMoney(p.price)}
                    </p>
                    {p.category && (
                      <p className="text-xs text-muted">{p.category}</p>
                    )}
                    <p className="mt-1 line-clamp-2 text-xs text-muted">
                      {p.description ?? (
                        <span className="text-danger">Missing description</span>
                      )}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Link to={`/products/${p.id}/edit`}>
                        <Button variant="ghost">Edit</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="!text-danger"
                        onClick={() => setDeleteTarget(p)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="hidden md:block">
            <DataTable>
              <DataTableHead>
                <tr>
                  <DataTableHeaderCell>Product</DataTableHeaderCell>
                  <DataTableHeaderCell>Category</DataTableHeaderCell>
                  <DataTableHeaderCell>Price</DataTableHeaderCell>
                  <DataTableHeaderCell>Description</DataTableHeaderCell>
                  <DataTableHeaderCell>Actions</DataTableHeaderCell>
                </tr>
              </DataTableHead>
              <tbody>
                {products.map((p) => (
                  <DataTableRow key={p.id}>
                    <DataTableCell>
                      <div className="flex items-center gap-3">
                        <ProductThumb product={p} />
                        <span className="max-w-[160px] truncate font-medium">
                          {p.title}
                        </span>
                      </div>
                    </DataTableCell>
                    <DataTableCell className="text-muted">
                      {p.category ?? "—"}
                    </DataTableCell>
                    <DataTableCell>{formatMoney(p.price)}</DataTableCell>
                    <DataTableCell className="max-w-[200px]">
                      {p.description ? (
                        <span className="line-clamp-2 text-muted">
                          {p.description}
                        </span>
                      ) : (
                        <span className="font-medium text-danger">Missing</span>
                      )}
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex justify-end gap-2">
                        <Link to={`/products/${p.id}/edit`}>
                          <Button variant="ghost">Edit</Button>
                        </Link>
                        <Button
                          variant="ghost"
                          onClick={() => setDeleteTarget(p)}
                          className="!text-danger"
                        >
                          Delete
                        </Button>
                      </div>
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

function ProductThumb({ product }: { product: Product }) {
  if (product.images[0]) {
    return (
      <img
        src={cloudinaryImageUrl(product.images[0], { width: 80, height: 80 })}
        alt=""
        className="h-10 w-10 shrink-0 rounded-lg border border-border object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-surface-overlay text-xs text-muted">
      —
    </div>
  );
}
