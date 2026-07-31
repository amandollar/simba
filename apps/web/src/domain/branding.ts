import type { CSSProperties } from "react";

export interface StoreBranding {
  logoUrl?: string | null;
  backgroundImageUrl?: string | null;
  accentColor?: string | null;
  tagline?: string | null;
}

export const DEFAULT_STORE_ACCENT = "#171717";

export const BRAND_ACCENT_PRESETS = [
  { id: "ink", label: "Ink", value: "#171717" },
  { id: "forest", label: "Forest", value: "#166534" },
  { id: "ocean", label: "Ocean", value: "#0369a1" },
  { id: "plum", label: "Plum", value: "#7e22ce" },
  { id: "rose", label: "Rose", value: "#be123c" },
  { id: "amber", label: "Amber", value: "#b45309" },
] as const;

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export function parseBranding(branding: unknown): StoreBranding {
  if (!branding || typeof branding !== "object") return {};
  const b = branding as Record<string, unknown>;
  return {
    logoUrl: typeof b.logoUrl === "string" ? b.logoUrl : null,
    backgroundImageUrl:
      typeof b.backgroundImageUrl === "string" ? b.backgroundImageUrl : null,
    accentColor:
      typeof b.accentColor === "string" && HEX_COLOR.test(b.accentColor)
        ? b.accentColor.toLowerCase()
        : null,
    tagline: typeof b.tagline === "string" ? b.tagline : null,
  };
}

export function normalizeAccentColor(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (!HEX_COLOR.test(withHash)) return "";
  return withHash.toLowerCase();
}

export function resolveAccentColor(branding: StoreBranding) {
  return branding.accentColor && HEX_COLOR.test(branding.accentColor)
    ? branding.accentColor
    : DEFAULT_STORE_ACCENT;
}

function darkenHex(hex: string, amount: number) {
  const raw = hex.replace("#", "");
  const clamp = (n: number) => Math.max(0, Math.min(255, n));
  const r = clamp(parseInt(raw.slice(0, 2), 16) - amount);
  const g = clamp(parseInt(raw.slice(2, 4), 16) - amount);
  const b = clamp(parseInt(raw.slice(4, 6), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function brandingCssProperties(branding: StoreBranding): CSSProperties {
  const accent = resolveAccentColor(branding);
  return {
    "--store-accent": accent,
    "--store-accent-hover": darkenHex(accent, 20),
  } as CSSProperties;
}
