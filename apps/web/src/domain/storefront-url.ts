export function storefrontPath(slug: string, subpath = "") {
  const base = `/store/${slug}`;
  if (!subpath) return base;
  return subpath.startsWith("/") ? `${base}${subpath}` : `${base}/${subpath}`;
}

export function storefrontProductPath(slug: string, productId: string) {
  return storefrontPath(slug, `p/${productId}`);
}

export function storefrontCheckoutPath(slug: string) {
  return storefrontPath(slug, "checkout");
}

export function storefrontSuccessPath(slug: string) {
  return storefrontPath(slug, "success");
}

export function storefrontUrl(slug: string) {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${storefrontPath(slug)}`;
  }
  return storefrontPath(slug);
}
