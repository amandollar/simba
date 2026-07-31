/**
 * Allowed browser origins for CORS.
 * Set WEB_ORIGIN (single) and/or WEB_ORIGINS (comma-separated).
 * Set ALLOW_VERCEL_PREVIEWS=true to allow *.vercel.app (preview deploys).
 */
export function isCorsOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;

  let hostname: string;
  try {
    hostname = new URL(origin).hostname;
  } catch {
    return false;
  }

  const allowed = new Set<string>([
    "http://localhost:3000",
    "http://localhost:3001",
  ]);

  if (process.env.WEB_ORIGIN?.trim()) {
    allowed.add(process.env.WEB_ORIGIN.trim().replace(/\/$/, ""));
  }

  for (const entry of process.env.WEB_ORIGINS?.split(",") ?? []) {
    const trimmed = entry.trim().replace(/\/$/, "");
    if (trimmed) allowed.add(trimmed);
  }

  if (allowed.has(origin.replace(/\/$/, ""))) return true;

  if (process.env.ALLOW_VERCEL_PREVIEWS === "true") {
    return hostname === "vercel.app" || hostname.endsWith(".vercel.app");
  }

  return false;
}
