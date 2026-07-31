import { Link } from "react-router-dom";
import { storefrontProductPath } from "@/domain/storefront-url";
import { StorefrontButton } from "@/presentation/components/storefront/StorefrontButton";
import { Icon, Check, Plus } from "@/presentation/components/ui/Icon";
import { formatPrice, ProductImage } from "./helpers";

type ProductCardProduct = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category?: string | null;
  images: string[];
  altText: string | null;
};

export function ProductCard({
  product,
  storeSlug,
  onAdd,
  added,
}: {
  product: ProductCardProduct;
  storeSlug: string;
  onAdd: () => void;
  added: boolean;
}) {
  const productUrl = storefrontProductPath(storeSlug, product.id);

  return (
    <article className="group flex flex-col">
      <Link
        to={productUrl}
        className="relative block overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-raised transition-shadow duration-200 hover:shadow-sm"
      >
        <ProductImage
          src={product.images[0]}
          alt={product.altText ?? product.title}
          className="aspect-[4/5] w-full transition-transform duration-300 group-hover:scale-[1.02]"
          width={600}
          height={750}
        />
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <Link to={productUrl} className="block">
          <h2 className="text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-foreground/80">
            {product.title}
          </h2>
          {product.category && (
            <p className="mt-1 text-xs text-muted">{product.category}</p>
          )}
        </Link>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-base font-medium tabular-nums tracking-tight">
            {formatPrice(product.price)}
          </span>
          <StorefrontButton
            variant={added ? "primary" : "secondary"}
            className="h-8 px-3 text-xs"
            onClick={(e) => {
              e.preventDefault();
              onAdd();
            }}
          >
            {added ? (
              <>
                <Icon icon={Check} size={14} />
                Added
              </>
            ) : (
              <>
                <Icon icon={Plus} size={14} />
                Add
              </>
            )}
          </StorefrontButton>
        </div>
      </div>
    </article>
  );
}
