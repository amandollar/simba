import { useMemo, useState } from "react";
import { useCart } from "@/application/storefront/CartContext";
import { parseBranding } from "@/domain/branding";
import { cloudinaryImageUrl } from "@/domain/cloudinary";
import { Icon, IconBox, Package, Search } from "@/presentation/components/ui/Icon";
import { Button } from "@/presentation/components/ui/Button";
import { EmptyState } from "@/presentation/components/ui/States";
import { ProductCard } from "./ProductCard";
import { useStorefront } from "./helpers";

type SortOption = "newest" | "price-asc" | "price-desc" | "name";

export function StorefrontHomePage() {
  const { store } = useStorefront();
  const { addItem } = useCart();
  const branding = parseBranding(store.branding);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  const hasFilters =
    search.trim() !== "" || category !== "all" || sort !== "newest";

  function clearFilters() {
    setSearch("");
    setCategory("all");
    setSort("newest");
  }

  const categories = useMemo(() => {
    const values = store.products
      .map((p) => p.category?.trim())
      .filter((c): c is string => Boolean(c));
    return [...new Set(values)].sort();
  }, [store.products]);

  const filteredProducts = useMemo(() => {
    let list = [...store.products];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return list;
  }, [store.products, search, category, sort]);

  const bgUrl = branding.backgroundImageUrl
    ? cloudinaryImageUrl(branding.backgroundImageUrl, {
        width: 1600,
        height: 500,
      })
    : null;

  function handleAdd(product: (typeof store.products)[0]) {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0],
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  }

  return (
    <div>
      <section
        className={`relative border-b border-border ${
          bgUrl ? "bg-cover bg-center" : "bg-surface-raised"
        }`}
        style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : undefined}
      >
        <div
          className={`mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 ${
            bgUrl ? "bg-gradient-to-r from-black/60 to-black/30 text-white" : ""
          }`}
        >
          <div className="max-w-xl">
            {branding.logoUrl && (
              <img
                src={cloudinaryImageUrl(branding.logoUrl, {
                  width: 120,
                  height: 120,
                })}
                alt=""
                className={`mb-5 h-14 w-14 rounded-[var(--radius-card)] border object-cover ${
                  bgUrl ? "border-white/20" : "border-border"
                }`}
              />
            )}
            <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
              {store.name}
            </h1>
            {branding.tagline && (
              <p
                className={`mt-2 text-sm font-medium sm:text-base ${
                  bgUrl ? "text-white/90" : "text-foreground"
                }`}
              >
                {branding.tagline}
              </p>
            )}
            {store.description && (
              <p
                className={`mt-3 max-w-lg text-sm leading-relaxed sm:text-base ${
                  bgUrl ? "text-white/85" : "text-muted"
                }`}
              >
                {store.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        {store.products.length === 0 ? (
          <EmptyState
            icon={<IconBox icon={Package} />}
            title="No products yet"
            message="This store hasn't listed any products."
          />
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Products</h2>
                <p className="mt-1 text-sm text-muted">
                  {filteredProducts.length} of {store.products.length} items
                  {hasFilters ? " · filtered" : ""}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Icon
                    icon={Search}
                    size={16}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products…"
                    className="h-9 w-full rounded-[var(--radius-control)] border border-border bg-surface-raised py-2 pr-3 pl-9 text-sm sm:w-52"
                  />
                </div>
                {categories.length > 0 && (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-9 rounded-[var(--radius-control)] border border-border bg-surface-raised px-3 text-sm"
                  >
                    <option value="all">All categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="h-9 rounded-[var(--radius-control)] border border-border bg-surface-raised px-3 text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="name">Name A–Z</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <EmptyState
                title="No matches"
                message="Try a different search or category."
                action={
                  hasFilters ? (
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    storeSlug={store.slug}
                    onAdd={() => handleAdd(product)}
                    added={addedId === product.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
