/**
 * Allowed browser origins for CORS.
 * - WEB_ORIGIN / WEB_ORIGINS: your production frontend(s)
 * - *.vercel.app is always allowed (Vercel production + preview deploys)
 */
export function isCorsOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;

  let hostname: string;
  try {
    hostname = new URL(origin).hostname;
  } catch {
    return false;
  }

  const normalized = origin.replace(/\/$/, "");

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

  if (allowed.has(normalized)) return true;

  // Vercel production + preview URLs (e.g. simba-web-lyart.vercel.app)
  if (hostname === "vercel.app" || hostname.endsWith(".vercel.app")) {
    return true;
  }

  if (process.env.ALLOW_VERCEL_PREVIEWS === "true") {
    return true; // legacy flag — vercel.app is allowed above
  }

  return false;
}

export function logCorsRejection(origin: string) {
  console.warn(
    `[cors] Blocked origin: ${origin}. Set WEB_ORIGIN or WEB_ORIGINS on the API.`
  );
}
