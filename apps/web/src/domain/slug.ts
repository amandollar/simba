export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export function normalizeSlugInput(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "");
}
