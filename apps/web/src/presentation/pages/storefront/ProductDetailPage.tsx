import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { PublicProduct } from "@/domain/types";
import { publicApi } from "@/infrastructure/api/public";
import { useCart } from "@/application/storefront/CartContext";
import { storefrontPath } from "@/domain/storefront-url";
import { StorefrontButton } from "@/presentation/components/storefront/StorefrontButton";
import { Button } from "@/presentation/components/ui/Button";
import { Field, Input, Textarea } from "@/presentation/components/ui/Form";
import { Icon, ArrowLeft, Check, Plus } from "@/presentation/components/ui/Icon";
import { Banner, ErrorState } from "@/presentation/components/ui/States";
import { ProductDetailSkeleton } from "@/presentation/components/ui/PageSkeletons";
import {
  formatPrice,
  ProductImage,
  StarRating,
  useStorefront,
} from "./helpers";

export function ProductDetailPage() {
  const { slug, productId } = useParams<{
    slug: string;
    productId: string;
  }>();
  const { store } = useStorefront();
  const { addItem } = useCart();

  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug || !productId) return;
    loadProduct();
  }, [slug, productId]);

  function loadProduct() {
    if (!slug || !productId) return;
    setLoading(true);
    setError(null);
    publicApi
      .product(slug, productId)
      .then(setProduct)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Product not found")
      )
      .finally(() => setLoading(false));
  }

  async function handleReview(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || !productId) return;
    setSubmitting(true);
    setReviewError(null);
    try {
      const review = await publicApi.submitReview(slug, productId, {
        authorName: authorName.trim(),
        rating,
        body: reviewBody.trim(),
      });
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              reviews: [review, ...prev.reviews],
              avgRating:
                (prev.reviews.reduce((s, r) => s + r.rating, 0) + rating) /
                (prev.reviews.length + 1),
            }
          : prev
      );
      setReviewBody("");
      setReviewSuccess(true);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <ProductDetailSkeleton />;
  if (error || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to={storefrontPath(store.slug)}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <Icon icon={ArrowLeft} size={16} />
          Back to store
        </Link>
        <ErrorState message={error ?? "Product not found"} onRetry={loadProduct} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to={storefrontPath(store.slug)}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <Icon icon={ArrowLeft} size={16} />
        Back to store
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-raised">
          <ProductImage
            src={product.images[0]}
            alt={product.altText ?? product.title}
            className="aspect-square w-full"
            width={800}
            height={800}
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {product.title}
          </h1>

          {product.avgRating !== null && (
            <div className="mt-3 flex items-center gap-2">
              <StarRating value={Math.round(product.avgRating)} size="sm" />
              <span className="text-sm text-muted">
                {product.avgRating.toFixed(1)} · {product.reviews.length}{" "}
                {product.reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>
          )}

          <p className="mt-5 text-2xl font-medium tabular-nums tracking-tight">
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <p className="mt-5 leading-relaxed text-muted">
              {product.description}
            </p>
          )}

          <StorefrontButton
            className="mt-8 h-11 w-full sm:w-auto sm:px-8"
            onClick={() => {
              addItem({
                productId: product.id,
                title: product.title,
                price: product.price,
                image: product.images[0],
              });
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }}
          >
            {added ? (
              <>
                <Icon icon={Check} size={16} />
                Added to cart
              </>
            ) : (
              <>
                <Icon icon={Plus} size={16} />
                Add to cart
              </>
            )}
          </StorefrontButton>
        </div>
      </div>

      <section className="mt-16 border-t border-border pt-12">
        <h2 className="text-lg font-semibold tracking-tight">Customer reviews</h2>

        <form
          onSubmit={handleReview}
          className="mt-6 max-w-lg space-y-4 rounded-[var(--radius-card)] border border-border bg-surface-raised p-5"
        >
          <p className="text-sm font-medium">Write a review</p>
          {reviewSuccess && (
            <Banner variant="success">Thanks for your review!</Banner>
          )}
          {reviewError && <Banner variant="error">{reviewError}</Banner>}
          <Field label="Your name" required>
            <Input
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
          </Field>
          <Field label="Rating">
            <StarRating value={rating} onChange={setRating} />
          </Field>
          <Field label="Review" required>
            <Textarea
              required
              rows={3}
              value={reviewBody}
              onChange={(e) => setReviewBody(e.target.value)}
            />
          </Field>
          <Button type="submit" variant="secondary" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit review"}
          </Button>
        </form>

        <div className="mt-8 space-y-4">
          {product.reviews.length === 0 ? (
            <p className="text-sm text-muted">No reviews yet. Be the first!</p>
          ) : (
            product.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {review.authorName ?? "Anonymous"}
                  </p>
                  <StarRating value={review.rating} size="sm" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {review.body}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
