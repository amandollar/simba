import { useState } from "react";
import { publicApi } from "@/infrastructure/api/public";
import { Button } from "@/presentation/components/ui/Button";
import { Field, Textarea } from "@/presentation/components/ui/Form";
import { Banner } from "@/presentation/components/ui/States";
import { Modal } from "@/presentation/components/ui/Modal";
import { ProductImage, StarRating } from "./helpers";

export type PurchasedItem = {
  productId: string;
  title: string;
  image?: string;
};

export function PostPurchaseReviewModal({
  open,
  onClose,
  slug,
  customerName,
  items,
}: {
  open: boolean;
  onClose: () => void;
  slug: string;
  customerName: string;
  items: PurchasedItem[];
}) {
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pending = items.filter((item) => !reviewed.has(item.productId));
  const current = pending[0];

  function resetForm() {
    setRating(5);
    setBody("");
    setError(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function goToNext(currentProductId: string) {
    const nextReviewed = new Set(reviewed);
    nextReviewed.add(currentProductId);
    setReviewed(nextReviewed);

    const remaining = items.filter((item) => !nextReviewed.has(item.productId));
    if (remaining.length === 0) {
      handleClose();
      return;
    }

    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!current) return;

    setSubmitting(true);
    setError(null);

    try {
      await publicApi.submitReview(slug, current.productId, {
        authorName: customerName.trim(),
        rating,
        body: body.trim(),
      });
      goToNext(current.productId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSkip() {
    if (!current) {
      handleClose();
      return;
    }
    goToNext(current.productId);
  }

  if (!current) return null;

  const step = items.length - pending.length + 1;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="How was your purchase?"
      description={
        items.length > 1
          ? `Review ${step} of ${items.length} — share feedback on what you bought.`
          : "Share a quick review of what you bought."
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface-overlay p-3">
          <ProductImage
            src={current.image}
            alt={current.title}
            className="h-14 w-14 shrink-0 rounded-lg border border-border"
            width={112}
            height={112}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{current.title}</p>
            <p className="mt-0.5 text-xs text-muted">Purchased just now</p>
          </div>
        </div>

        {error && <Banner variant="error">{error}</Banner>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Rating">
            <StarRating value={rating} onChange={setRating} />
          </Field>
          <Field label="Your review" required>
            <Textarea
              required
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What did you like? Would you recommend it?"
            />
          </Field>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || !body.trim()}
              className="flex-1"
            >
              {submitting ? "Submitting…" : "Submit review"}
            </Button>
            <Button type="button" variant="ghost" onClick={handleSkip}>
              {pending.length > 1 ? "Skip" : "Not now"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
