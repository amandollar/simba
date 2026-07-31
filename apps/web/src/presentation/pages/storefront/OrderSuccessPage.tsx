import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { storefrontPath } from "@/domain/storefront-url";
import { Button } from "@/presentation/components/ui/Button";
import { Icon, Check } from "@/presentation/components/ui/Icon";
import { useStorefront } from "./helpers";
import {
  PostPurchaseReviewModal,
  type PurchasedItem,
} from "./PostPurchaseReviewModal";

type OrderSuccessState = {
  orderId?: string;
  customerName?: string;
  purchasedItems?: PurchasedItem[];
};

export function OrderSuccessPage() {
  const { store } = useStorefront();
  const location = useLocation();
  const state = (location.state as OrderSuccessState | null) ?? {};

  const [showReviewModal, setShowReviewModal] = useState(false);

  const purchasedItems = state.purchasedItems ?? [];
  const customerName = state.customerName ?? "";

  useEffect(() => {
    if (purchasedItems.length > 0) {
      setShowReviewModal(true);
    }
  }, [purchasedItems.length]);

  return (
    <>
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface-raised">
          <Icon icon={Check} size={28} className="text-success" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Order confirmed
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Thanks for your purchase. Save your order number below for your
          records.
        </p>
        {state.orderId && (
          <p className="mt-3 text-xs text-muted">
            Order #{state.orderId.slice(0, 8).toUpperCase()}
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {purchasedItems.length > 0 && !showReviewModal && (
            <Button variant="primary" onClick={() => setShowReviewModal(true)}>
              Leave a review
            </Button>
          )}
          <Link to={storefrontPath(store.slug)}>
            <Button variant="secondary">Continue shopping</Button>
          </Link>
        </div>
      </div>

      {purchasedItems.length > 0 && customerName && (
        <PostPurchaseReviewModal
          open={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          slug={store.slug}
          customerName={customerName}
          items={purchasedItems}
        />
      )}
    </>
  );
}
