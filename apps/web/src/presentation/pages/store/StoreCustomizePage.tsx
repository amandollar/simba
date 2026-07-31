import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  useFlashMessage,
  useMerchant,
  useUpdateStore,
} from "@/application/hooks";
import {
  BRAND_ACCENT_PRESETS,
  DEFAULT_STORE_ACCENT,
  brandingCssProperties,
  normalizeAccentColor,
  parseBranding,
  resolveAccentColor,
} from "@/domain/branding";
import { cloudinaryImageUrl } from "@/domain/cloudinary";
import { storefrontUrl } from "@/domain/storefront-url";
import { StorefrontButton } from "@/presentation/components/storefront/StorefrontButton";
import { Button } from "@/presentation/components/ui/Button";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import { Field, Input } from "@/presentation/components/ui/Form";
import { Icon, ArrowLeft, Palette, Store } from "@/presentation/components/ui/Icon";
import { ImageUpload } from "@/presentation/components/ui/ImageUpload";
import { PageHeader } from "@/presentation/components/ui/PageHeader";
import { Banner } from "@/presentation/components/ui/States";
import { FormPageSkeleton } from "@/presentation/components/ui/PageSkeletons";

export function StoreCustomizePage() {
  const { data: merchant, loading, reload } = useMerchant();
  const { mutate: update, loading: saving, error: saveError } = useUpdateStore(reload);
  const { message: saved, show: showSaved, clear: clearSaved } =
    useFlashMessage();

  const [logoUrl, setLogoUrl] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [tagline, setTagline] = useState("");
  const [accentColor, setAccentColor] = useState(DEFAULT_STORE_ACCENT);

  useEffect(() => {
    if (!merchant) return;
    const branding = parseBranding(merchant.branding);
    setLogoUrl(branding.logoUrl ?? "");
    setBackgroundImageUrl(branding.backgroundImageUrl ?? "");
    setTagline(branding.tagline ?? "");
    setAccentColor(resolveAccentColor(branding));
  }, [merchant]);

  if (loading) return <FormPageSkeleton fields={4} />;

  const previewBranding = {
    logoUrl: logoUrl.trim() || null,
    backgroundImageUrl: backgroundImageUrl.trim() || null,
    tagline: tagline.trim() || null,
    accentColor: normalizeAccentColor(accentColor) || DEFAULT_STORE_ACCENT,
  };
  const previewBg = previewBranding.backgroundImageUrl
    ? cloudinaryImageUrl(previewBranding.backgroundImageUrl, {
        width: 800,
        height: 300,
      })
    : undefined;
  const storeUrl = merchant?.slug ? storefrontUrl(merchant.slug) : "";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const normalizedAccent = normalizeAccentColor(accentColor);
    const result = await update({
      branding: {
        logoUrl: logoUrl.trim() || null,
        backgroundImageUrl: backgroundImageUrl.trim() || null,
        tagline: tagline.trim() || null,
        accentColor: normalizedAccent || DEFAULT_STORE_ACCENT,
      },
    });
    if (result) showSaved("Store appearance saved");
  }

  function selectPreset(value: string) {
    setAccentColor(value);
  }

  return (
    <div>
      <Link
        to="/store"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <Icon icon={ArrowLeft} size={16} />
        Back to store details
      </Link>

      <PageHeader
        title="Customize store"
        description="Logo, colors, and hero — what shoppers see on your storefront"
        action={
          storeUrl ? (
            <a href={storeUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">
                {merchant?.launchedAt ? "View store ↗" : "Preview store ↗"}
              </Button>
            </a>
          ) : undefined
        }
      />

      {saved && (
        <div className="mb-4">
          <Banner variant="success" onDismiss={clearSaved}>
            {saved}
          </Banner>
        </div>
      )}

      {saveError && (
        <div className="mb-4">
          <Banner variant="error">{saveError}</Banner>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardBody className="space-y-5">
              <div>
                <h3 className="font-semibold">Visual identity</h3>
                <p className="mt-1 text-sm text-muted">
                  Shown in your storefront header and hero banner.
                </p>
              </div>

              <Field label="Store logo" hint="Square image, shown in the header">
                <ImageUpload
                  value={logoUrl}
                  onChange={setLogoUrl}
                  onClear={() => setLogoUrl("")}
                  disabled={saving}
                  purpose="branding"
                  label="Upload logo"
                  aspect="square"
                />
              </Field>

              <Field
                label="Hero background"
                hint="Wide banner at the top of your store home page"
              >
                <ImageUpload
                  value={backgroundImageUrl}
                  onChange={setBackgroundImageUrl}
                  onClear={() => setBackgroundImageUrl("")}
                  disabled={saving}
                  purpose="branding"
                  label="Upload background"
                  aspect="wide"
                />
              </Field>

              <Field
                label="Tagline"
                hint="Short line under your store name — e.g. “Handmade ceramics from Portland”"
              >
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="A short line about your store"
                  maxLength={120}
                />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon icon={Palette} size={18} className="text-muted" />
                <div>
                  <h3 className="font-semibold">Brand color</h3>
                  <p className="mt-0.5 text-sm text-muted">
                    Used for buttons and accents on your storefront.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {BRAND_ACCENT_PRESETS.map((preset) => {
                  const active =
                    resolveAccentColor({ accentColor }) === preset.value;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      title={preset.label}
                      onClick={() => selectPreset(preset.value)}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-transform hover:scale-105 ${
                        active
                          ? "border-foreground ring-2 ring-foreground/20"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: preset.value }}
                    >
                      <span className="sr-only">{preset.label}</span>
                    </button>
                  );
                })}
              </div>

              <Field label="Custom color">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={
                      normalizeAccentColor(accentColor) || DEFAULT_STORE_ACCENT
                    }
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-[var(--radius-control)] border border-border bg-transparent p-1"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    placeholder="#171717"
                    maxLength={7}
                    className="font-mono"
                  />
                </div>
              </Field>
            </CardBody>
          </Card>

          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving…" : "Save appearance"}
          </Button>
        </form>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                Live preview
              </p>
            </div>
            <div
              style={brandingCssProperties(previewBranding)}
              className="bg-surface"
            >
              <div
                className={`relative border-b border-border ${
                  previewBg ? "bg-cover bg-center" : "bg-surface-raised"
                }`}
                style={
                  previewBg
                    ? { backgroundImage: `url(${previewBg})` }
                    : undefined
                }
              >
                <div
                  className={`px-4 py-8 ${
                    previewBg
                      ? "bg-gradient-to-r from-black/60 to-black/30 text-white"
                      : ""
                  }`}
                >
                  {previewBranding.logoUrl ? (
                    <img
                      src={cloudinaryImageUrl(previewBranding.logoUrl, {
                        width: 80,
                        height: 80,
                      })}
                      alt=""
                      className={`mb-3 h-10 w-10 rounded-lg border object-cover ${
                        previewBg ? "border-white/20" : "border-border"
                      }`}
                    />
                  ) : (
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-overlay">
                      <Icon icon={Store} size={16} className="text-muted" />
                    </div>
                  )}
                  <p className="text-sm font-semibold">
                    {merchant?.name ?? "Your store"}
                  </p>
                  {previewBranding.tagline && (
                    <p
                      className={`mt-1 text-xs ${
                        previewBg ? "text-white/85" : "text-muted"
                      }`}
                    >
                      {previewBranding.tagline}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div className="h-16 rounded-lg border border-border bg-surface-raised" />
                <StorefrontButton className="h-8 w-full text-xs">
                  Add to cart
                </StorefrontButton>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
