import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { publicApi } from "@/infrastructure/api/public";
import { useCart } from "@/application/storefront/CartContext";
import {
  storefrontPath,
  storefrontSuccessPath,
} from "@/domain/storefront-url";
import { Icon, ArrowLeft, IconBox, Minus, Plus, ShoppingCart, Trash2 } from "@/presentation/components/ui/Icon";
import { StorefrontButton } from "@/presentation/components/storefront/StorefrontButton";
import { Button } from "@/presentation/components/ui/Button";
import { Field, Input } from "@/presentation/components/ui/Form";
import { EmptyState } from "@/presentation/components/ui/States";
import {
  formatPrice,
  ProductImage,
  useStorefront,
} from "./helpers";

export function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { store } = useStorefront();
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || items.length === 0) return;

    setProcessing(true);
    setError(null);

    try {
      setPaying(true);
      await new Promise((r) => setTimeout(r, 1200));

      const order = await publicApi.checkout(slug, {
        name: name.trim(),
        email: email.trim(),
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });

      const purchasedItems = Array.from(
        new Map(
          items.map((item) => [
            item.productId,
            {
              productId: item.productId,
              title: item.title,
              image: item.image,
            },
          ])
        ).values()
      );

      clearCart();
      navigate(storefrontSuccessPath(slug), {
        state: {
          orderId: order.id,
          customerName: name.trim(),
          purchasedItems,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setProcessing(false);
      setPaying(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <EmptyState
          icon={<IconBox icon={ShoppingCart} />}
          title="Your cart is empty"
          message="Browse the store and add something you like."
          action={
            <Link to={storefrontPath(store.slug)}>
              <Button variant="secondary">Continue shopping</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to={storefrontPath(store.slug)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <Icon icon={ArrowLeft} size={16} />
        Continue shopping
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
      <p className="mt-1 text-sm text-muted">Guest checkout — no account needed</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5">
            <h2 className="text-sm font-semibold">Contact</h2>
            <div className="mt-4 space-y-3">
              <Field label="Full name" required>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="Email" required>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5">
            <h2 className="text-sm font-semibold">Payment</h2>
            <p className="mt-2 text-sm text-muted">
              Simulated payment — no real card charged.
            </p>
            <div className="mt-4 space-y-3">
              <input
                readOnly
                value="4242 4242 4242 4242"
                className="w-full rounded-lg border border-border bg-surface-overlay px-3 py-2.5 text-sm text-muted"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  readOnly
                  value="12/28"
                  className="rounded-lg border border-border bg-surface-overlay px-3 py-2.5 text-sm text-muted"
                />
                <input
                  readOnly
                  value="123"
                  className="rounded-lg border border-border bg-surface-overlay px-3 py-2.5 text-sm text-muted"
                />
              </div>
            </div>
          </section>

          {error && <p className="text-sm text-danger">{error}</p>}

          <StorefrontButton
            type="submit"
            disabled={processing}
            className="h-11 w-full sm:w-auto sm:px-8"
          >
            {paying
              ? "Processing payment…"
              : processing
                ? "Placing order…"
                : `Pay ${formatPrice(subtotal)}`}
          </StorefrontButton>
        </form>

        <aside className="h-fit rounded-[var(--radius-card)] border border-border bg-surface-raised p-5">
          <h2 className="text-sm font-semibold">Order summary</h2>
          <ul className="mt-4 divide-y divide-border">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                <ProductImage
                  src={item.image}
                  alt={item.title}
                  className="h-16 w-16 shrink-0 rounded-lg border border-border"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="mt-0.5 text-sm tabular-nums text-muted">
                    {formatPrice(item.price)}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] border border-border transition-colors hover:bg-surface-overlay"
                    >
                      <Icon icon={Minus} size={14} />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] border border-border transition-colors hover:bg-surface-overlay"
                    >
                      <Icon icon={Plus} size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      aria-label="Remove item"
                      className="ml-auto flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] text-muted transition-colors hover:bg-red-50 hover:text-danger"
                    >
                      <Icon icon={Trash2} size={14} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-between border-t border-border pt-4 text-sm font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
