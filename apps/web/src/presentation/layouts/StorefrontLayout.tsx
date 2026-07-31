import { Link, Outlet, useParams } from "react-router-dom";
import type { PublicStore } from "@/domain/types";
import { parseBranding, brandingCssProperties } from "@/domain/branding";
import { cloudinaryImageUrl } from "@/domain/cloudinary";
import {
  storefrontCheckoutPath,
  storefrontPath,
} from "@/domain/storefront-url";
import { publicApi } from "@/infrastructure/api/public";
import { CartProvider, useCart } from "@/application/storefront/CartContext";
import { Icon, ShoppingCart, Store } from "@/presentation/components/ui/Icon";
import { ErrorState } from "@/presentation/components/ui/States";
import { StorefrontSkeleton } from "@/presentation/components/ui/PageSkeletons";
import { useEffect, useState } from "react";

function StorefrontHeader({ store }: { store: PublicStore }) {
  const { slug } = useParams<{ slug: string }>();
  const { itemCount } = useCart();
  const branding = parseBranding(store.branding);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface-raised/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to={storefrontPath(slug!)}
          className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
        >
          {branding.logoUrl ? (
            <img
              src={cloudinaryImageUrl(branding.logoUrl, { width: 80, height: 80 })}
              alt=""
              className="h-9 w-9 shrink-0 rounded-lg border border-border object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-overlay">
              <Icon icon={Store} size={18} className="text-muted" />
            </div>
          )}
          <span className="truncate text-base font-semibold tracking-tight sm:text-lg">
            {store.name}
          </span>
        </Link>

        <Link
          to={storefrontCheckoutPath(slug!)}
          aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-raised transition-colors hover:bg-surface-overlay"
        >
          <Icon icon={ShoppingCart} size={18} className="text-foreground" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--store-accent)] px-1 text-[10px] font-semibold text-white">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

function StoreNotOpenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-raised">
        <Icon icon={Store} size={24} className="text-muted" />
      </div>
      <h1 className="mt-6 text-xl font-semibold tracking-tight">
        Store not open yet
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        This store hasn&apos;t launched. Check back soon — or sign in if
        you&apos;re the owner.
      </p>
      <Link
        to="/sign-in"
        className="mt-6 text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        Merchant sign in
      </Link>
    </div>
  );
}

function StorefrontInner() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<PublicStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notLaunched, setNotLaunched] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotLaunched(false);
    publicApi
      .store(slug)
      .then(setStore)
      .catch((e) => {
        const message = e instanceof Error ? e.message : "Store not found";
        if (message.toLowerCase().includes("not open")) {
          setNotLaunched(true);
        } else {
          setError(message);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <StorefrontSkeleton />
      </div>
    );
  }

  if (notLaunched) return <StoreNotOpenPage />;

  if (error || !store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-6">
        <ErrorState message={error ?? "Store not found"} />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-surface"
      style={brandingCssProperties(parseBranding(store.branding))}
    >
      <StorefrontHeader store={store} />
      <main className="flex-1">
        <Outlet context={{ store }} />
      </main>
      <footer className="border-t border-border py-8 text-center">
        <p className="text-xs text-muted">Powered by Simba</p>
      </footer>
    </div>
  );
}

export function StorefrontLayout() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return null;

  return (
    <CartProvider slug={slug}>
      <StorefrontInner />
    </CartProvider>
  );
}
