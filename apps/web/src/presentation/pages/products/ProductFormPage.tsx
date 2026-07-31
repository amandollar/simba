import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  useCreateProduct,
  useFlashMessage,
  useOptimizeCopy,
  useProducts,
  useUpdateProduct,
} from "@/application/hooks";
import type { CopyOptimizationResult } from "@/domain/types";
import { ProductChangesPreview } from "@/presentation/components/simba/ProductChangesPreview";
import { Button } from "@/presentation/components/ui/Button";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import { Field, Input, Textarea } from "@/presentation/components/ui/Form";
import { Icon, ArrowLeft, Sparkles } from "@/presentation/components/ui/Icon";
import { ImageUpload } from "@/presentation/components/ui/ImageUpload";
import { Modal } from "@/presentation/components/ui/Modal";
import { PageHeader } from "@/presentation/components/ui/PageHeader";
import { Banner, ErrorState } from "@/presentation/components/ui/States";
import { FormPageSkeleton } from "@/presentation/components/ui/PageSkeletons";

function applyChangesToForm(
  changes: CopyOptimizationResult["changes"],
  setters: {
    setTitle: (v: string) => void;
    setDescription: (v: string) => void;
    setAltText: (v: string) => void;
    setCategory: (v: string) => void;
  }
) {
  if (changes.title) setters.setTitle(changes.title);
  if (changes.description) setters.setDescription(changes.description);
  if (changes.altText) setters.setAltText(changes.altText);
  if (changes.category) setters.setCategory(changes.category);
}

export function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromOnboarding = searchParams.get("onboarding") === "1";
  const { data: products, loading, reload: reloadProducts } = useProducts();
  const { mutate: create, loading: creating, error: createError } =
    useCreateProduct(() =>
      navigate(fromOnboarding ? "/getting-started" : "/products")
    );
  const { mutate: update, loading: updating, error: updateError } =
    useUpdateProduct();
  const { message: saved, show: showSaved } = useFlashMessage();
  const { preview: optimizePreview, apply: optimizeApply } = useOptimizeCopy(
    () => reloadProducts()
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [category, setCategory] = useState("");
  const [copyPreview, setCopyPreview] = useState<CopyOptimizationResult | null>(
    null
  );
  const [priceError, setPriceError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !products || !id) return;
    const product = products.find((p) => p.id === id);
    if (product) {
      setTitle(product.title);
      setDescription(product.description ?? "");
      setPrice(String(product.price));
      setImageUrl(product.images[0] ?? "");
      setAltText(product.altText ?? "");
      setCategory(product.category ?? "");
    }
  }, [isEdit, products, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceValue = parseFloat(price);
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setPriceError("Enter a valid price greater than $0.");
      return;
    }
    setPriceError(null);

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      price: priceValue,
      category: category.trim() || undefined,
      images: imageUrl.trim() ? [imageUrl.trim()] : [],
      altText: altText.trim() || undefined,
    };

    if (isEdit && id) {
      const result = await update({ id, data });
      if (result) showSaved("Product saved");
    } else {
      await create(data);
    }
  }

  async function handleOptimizeCopy() {
    if (!id) return;
    const result = await optimizePreview.mutate(id);
    if (result) setCopyPreview(result);
  }

  async function handleApplyCopy() {
    if (!id || !copyPreview) return;
    const result = await optimizeApply.mutate(id, copyPreview.changes);
    if (result) {
      applyChangesToForm(copyPreview.changes, {
        setTitle,
        setDescription,
        setAltText,
        setCategory,
      });
      setCopyPreview(null);
      showSaved("Copy updated with Simba");
    }
  }

  const from = searchParams.get("from");
  const backTo = fromOnboarding
    ? "/getting-started"
    : from && from.startsWith("/")
      ? from
      : "/products";
  const backLabel =
    backTo === "/getting-started"
      ? "Back to getting started"
      : backTo === "/simba/issues"
        ? "Back to fixes"
        : backTo === "/simba"
          ? "Back to audit center"
          : "Back to products";

  if (isEdit && loading) return <FormPageSkeleton fields={6} />;

  const product =
    isEdit && products && id ? products.find((p) => p.id === id) : undefined;

  if (isEdit && products && id && !product) {
    return (
      <div>
        <Link
          to={backTo}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <Icon icon={ArrowLeft} size={16} />
          {backLabel}
        </Link>
        <ErrorState message="Product not found" />
      </div>
    );
  }

  const saving = creating || updating;
  const error = createError || updateError;
  const optimizing = optimizePreview.loading || optimizeApply.loading;
  const optimizeError = optimizePreview.error || optimizeApply.error;

  return (
    <div>
      <Link
        to={backTo}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <Icon icon={ArrowLeft} size={16} />
        {backLabel}
      </Link>

      <PageHeader
        title={isEdit ? "Edit product" : "Add product"}
        description={
          isEdit ? "Update your product listing" : "Add a new product to your store"
        }
        action={
          isEdit ? (
            <Button
              type="button"
              variant="simba"
              onClick={handleOptimizeCopy}
              disabled={optimizing || saving}
            >
              <Icon icon={Sparkles} size={16} className="mr-1.5" />
              {optimizePreview.loading ? "Analyzing…" : "Improve with Simba"}
            </Button>
          ) : undefined
        }
      />

      {saved && (
        <div className="mb-4">
          <Banner variant="success">{saved}</Banner>
        </div>
      )}

      {optimizeError && !copyPreview && (
        <div className="mb-4">
          <Banner variant="error">{optimizeError}</Banner>
        </div>
      )}

      <Card className="max-w-xl">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Title" required>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>

            <Field label="Price (USD)" required>
              <Input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (priceError) setPriceError(null);
                }}
              />
              {priceError && (
                <p className="mt-1.5 text-sm text-danger">{priceError}</p>
              )}
            </Field>

            <Field label="Category" hint="e.g. Outdoor, Apparel, Sale">
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Outdoor"
              />
            </Field>

            <Field label="Description">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </Field>

            <Field label="Product image">
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                onClear={() => setImageUrl("")}
                disabled={saving}
              />
            </Field>

            <Field
              label="Alt text"
              hint="Describe the image for accessibility and SEO"
            >
              <Input
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g. Blue ceramic mug on wooden table"
              />
            </Field>

            {error && <p className="text-sm text-danger">{error}</p>}

            <div className="flex gap-2 pt-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
              </Button>
              <Link to={backTo}>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>

      <Modal
        open={Boolean(copyPreview)}
        onClose={() => setCopyPreview(null)}
        disableClose={optimizeApply.loading}
        title="Copy improvements"
        description="Simba's copy agent reviewed this listing for SEO, clarity, and conversion."
      >
        {copyPreview && (
          <div className="max-h-[min(60vh,28rem)] space-y-4 overflow-y-auto pr-1 scrollbar-thin">
            <p className="text-sm leading-relaxed text-muted">
              {copyPreview.summary}
            </p>

            <div className="flex items-center gap-3 rounded-[var(--radius-control)] border border-border bg-surface-overlay px-3 py-2">
              <span className="text-xs text-muted">Copy quality</span>
              <span className="text-sm font-medium tabular-nums">
                {copyPreview.copyScore.before}/10
              </span>
              <span className="text-muted">→</span>
              <span className="text-sm font-semibold tabular-nums text-simba">
                {copyPreview.copyScore.after}/10
              </span>
            </div>

            <ul className="space-y-1.5 text-sm text-muted">
              {copyPreview.improvements.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-simba">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <ProductChangesPreview changes={copyPreview.changes} />

            {optimizeApply.error && (
              <Banner variant="error">{optimizeApply.error}</Banner>
            )}

            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button
                variant="simba"
                onClick={handleApplyCopy}
                disabled={optimizeApply.loading}
              >
                {optimizeApply.loading ? "Applying…" : "Apply improvements"}
              </Button>
              <Button variant="ghost" onClick={() => setCopyPreview(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
