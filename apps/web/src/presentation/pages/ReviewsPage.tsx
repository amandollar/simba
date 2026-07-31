import { IconBox, Star } from "@/presentation/components/ui/Icon";
import { useReviews } from "@/application/hooks";
import { Card, CardBody } from "@/presentation/components/ui/Card";
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
import type { Review } from "@/domain/types";

export function ReviewsPage() {
  const { data: reviews, loading, error, reload } = useReviews();

  if (loading) return <TablePageSkeleton rows={5} columns={4} />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description={`${reviews?.length ?? 0} customer reviews`}
      />

      {!reviews?.length ? (
        <EmptyState
          icon={<IconBox icon={Star} />}
          title="No reviews yet"
          message="Customers can leave reviews on product pages in your storefront."
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          <div className="hidden md:block">
            <DataTable>
              <DataTableHead>
                <tr>
                  <DataTableHeaderCell>Product</DataTableHeaderCell>
                  <DataTableHeaderCell>Rating</DataTableHeaderCell>
                  <DataTableHeaderCell>Review</DataTableHeaderCell>
                  <DataTableHeaderCell>Author</DataTableHeaderCell>
                  <DataTableHeaderCell>Date</DataTableHeaderCell>
                </tr>
              </DataTableHead>
              <tbody>
                {reviews.map((review) => (
                  <DataTableRow key={review.id}>
                    <DataTableCell className="font-medium">
                      {review.product?.title}
                    </DataTableCell>
                    <DataTableCell>
                      <StarRating value={review.rating} />
                    </DataTableCell>
                    <DataTableCell className="max-w-xs">
                      <p className="line-clamp-2 text-muted">{review.body}</p>
                    </DataTableCell>
                    <DataTableCell>
                      {review.authorName ?? "Anonymous"}
                    </DataTableCell>
                    <DataTableCell className="text-muted">
                      {new Date(review.createdAt).toLocaleDateString()}
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

function ReviewCard({ review }: { review: Review }) {
  return (
    <Card>
      <CardBody className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">{review.product?.title}</p>
          <StarRating value={review.rating} />
        </div>
        <p className="text-sm text-muted">{review.body}</p>
        <p className="text-xs text-muted">
          {review.authorName ?? "Anonymous"} ·{" "}
          {new Date(review.createdAt).toLocaleDateString()}
        </p>
      </CardBody>
    </Card>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <span className="text-amber-500">
      {"★".repeat(value)}
      {"☆".repeat(5 - value)}
    </span>
  );
}
