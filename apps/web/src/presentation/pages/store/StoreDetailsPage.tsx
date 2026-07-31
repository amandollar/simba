import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  useFlashMessage,
  useLaunchStore,
  useLaunchReadiness,
  useMerchant,
  useUpdateStore,
} from "@/application/hooks";
import { parseBranding } from "@/domain/branding";
import { cloudinaryImageUrl } from "@/domain/cloudinary";
import { normalizeSlugInput } from "@/domain/slug";
import { storefrontUrl } from "@/domain/storefront-url";
import { LaunchChecklist } from "@/presentation/components/dashboard/LaunchChecklist";
import { Button } from "@/presentation/components/ui/Button";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import { Field, Input, Textarea } from "@/presentation/components/ui/Form";
import { Icon, Palette, Store } from "@/presentation/components/ui/Icon";
import { PageHeader } from "@/presentation/components/ui/PageHeader";
import { Banner } from "@/presentation/components/ui/States";
import { FormPageSkeleton } from "@/presentation/components/ui/PageSkeletons";

export function StoreDetailsPage() {
  const { data: merchant, loading, reload } = useMerchant();
  const notLaunched = !merchant?.launchedAt;
  const {
    data: launchReadiness,
    reload: reloadLaunchReadiness,
  } = useLaunchReadiness(notLaunched && !loading);
  const { mutate: update, loading: saving, error: saveError } = useUpdateStore(() => {
    reload();
    reloadLaunchReadiness();
  });
  const { mutate: launch, loading: launching, error: launchError } =
    useLaunchStore(() => {
      reload();
      reloadLaunchReadiness();
    });
  const { message: saved, show: showSaved, clear: clearSaved } =
    useFlashMessage();
  const { message: launched, show: showLaunched } = useFlashMessage();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const storeUrl = slug.trim() ? storefrontUrl(slug.trim()) : "";
  const slugChanged = Boolean(merchant?.slug && slug.trim() !== merchant.slug);

  useEffect(() => {
    if (merchant) {
      setName(merchant.name);
      setSlug(merchant.slug);
      setDescription(merchant.description ?? "");
    }
  }, [merchant]);

  if (loading) return <FormPageSkeleton fields={5} />;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const result = await update({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
    });
    if (result) showSaved("Store details saved");
  }

  async function handleLaunch() {
    const result = await launch();
    if (result) showLaunched("Store launched — customers can shop now");
  }

  async function copyStoreUrl() {
    if (!storeUrl) return;
    await navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const branding = parseBranding(merchant?.branding);
  const previewBg = branding.backgroundImageUrl
    ? cloudinaryImageUrl(branding.backgroundImageUrl, { width: 800, height: 300 })
    : undefined;

  return (
    <div>
      <PageHeader
        title="Store details"
        description="Your storefront info — Simba AI audits this data"
        action={
          <div className="flex flex-wrap gap-2">
            {merchant?.slug && (
              <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary">
                  {merchant.launchedAt ? "View store ↗" : "Preview store ↗"}
                </Button>
              </a>
            )}
          </div>
        }
      />

      <div className="mb-4 space-y-3">
        {saved && (
          <Banner variant="success" onDismiss={clearSaved}>
            {saved}
          </Banner>
        )}
        {launched && <Banner variant="success">{launched}</Banner>}
        {launchError && <Banner variant="error">{launchError}</Banner>}
        {saveError && <Banner variant="error">{saveError}</Banner>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardBody className="space-y-4">
              <Field label="Store name" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>

              <Field
                label="Store URL"
                hint={
                  merchant?.launchedAt && slugChanged
                    ? "Saving will change your live link — old URLs will stop working."
                    : "Lowercase letters, numbers, and hyphens only."
                }
              >
                <div className="flex items-center rounded-[var(--radius-control)] border border-border bg-surface-raised focus-within:border-foreground/30 focus-within:ring-2 focus-within:ring-foreground/10">
                  <span className="shrink-0 border-r border-border px-3 py-2 text-sm text-muted">
                    /store/
                  </span>
                  <input
                    required
                    value={slug}
                    onChange={(e) => setSlug(normalizeSlugInput(e.target.value))}
                    placeholder="your-store"
                    pattern="[a-z0-9-]+"
                    minLength={3}
                    maxLength={50}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  />
                </div>
                {storeUrl && (
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <p className="min-w-0 flex-1 truncate text-xs text-muted">
                      {storeUrl}
                    </p>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={copyStoreUrl}
                        className="h-8 px-3 text-xs"
                      >
                        {copied ? "Copied!" : "Copy link"}
                      </Button>
                      <a
                        href={storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 px-3 text-xs"
                        >
                          Open
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </Field>

              <Field label="Description">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
              </Field>
            </CardBody>
          </Card>

          <Link
            to="/store/customize"
            className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface-raised p-4 transition-colors hover:border-border-strong hover:bg-surface-overlay"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-surface-overlay">
              <Icon icon={Palette} size={18} className="text-muted" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">Customize appearance</p>
              <p className="text-xs text-muted">
                Logo, hero image, brand color, and tagline
              </p>
            </div>
            <span className="ml-auto text-sm text-muted">→</span>
          </Link>

          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>

        <div className="space-y-4">
          {notLaunched && launchReadiness && (
            <LaunchChecklist
              readiness={launchReadiness}
              showLaunchAction
              onLaunch={handleLaunch}
              launching={launching}
            />
          )}

          <Card className="h-fit overflow-hidden">
            <div
              className="relative h-20 bg-surface-overlay bg-cover bg-center"
              style={
                previewBg ? { backgroundImage: `url(${previewBg})` } : undefined
              }
            />
            <CardBody className="space-y-4">
              <div className="-mt-8 flex flex-col items-center text-center">
                {branding.logoUrl ? (
                  <img
                    src={cloudinaryImageUrl(branding.logoUrl, {
                      width: 80,
                      height: 80,
                    })}
                    alt=""
                    className="h-14 w-14 rounded-[var(--radius-card)] border border-border bg-surface-raised object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-card)] border border-border bg-surface-raised">
                    <Icon icon={Store} size={24} className="text-muted" />
                  </div>
                )}
                <p className="mt-3 text-sm font-medium">{name || merchant?.name}</p>
                {branding.tagline && (
                  <p className="mt-1 text-xs text-muted">{branding.tagline}</p>
                )}
              </div>
              <p className="text-center text-xs text-muted">
                {merchant?.launchedAt
                  ? `Live since ${new Date(merchant.launchedAt).toLocaleDateString()}`
                  : "Draft"}
              </p>
              <Link
                to="/store/customize"
                className="block text-center text-xs font-medium text-foreground underline-offset-4 hover:underline"
              >
                Edit appearance
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
