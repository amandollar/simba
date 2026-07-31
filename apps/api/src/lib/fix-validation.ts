import type { StoreSnapshot } from "./store-snapshot.js";

const LIMITS = {
  title: 200,
  description: 2000,
  altText: 200,
  category: 50,
} as const;

export type ProductFieldChange = {
  productId: string;
  title?: string;
  description?: string;
  altText?: string;
  category?: string;
};

export function sanitizeProductChanges(
  changes: ProductFieldChange
): ProductFieldChange | null {
  const sanitized: ProductFieldChange = { productId: changes.productId };

  if (changes.title !== undefined) {
    const title = changes.title.trim().slice(0, LIMITS.title);
    if (!title) return null;
    sanitized.title = title;
  }
  if (changes.description !== undefined) {
    sanitized.description = changes.description.trim().slice(0, LIMITS.description);
  }
  if (changes.altText !== undefined) {
    sanitized.altText = changes.altText.trim().slice(0, LIMITS.altText);
  }
  if (changes.category !== undefined) {
    const category = changes.category.trim().slice(0, LIMITS.category);
    if (!category) return null;
    sanitized.category = category;
  }

  const hasChange =
    sanitized.title !== undefined ||
    sanitized.description !== undefined ||
    sanitized.altText !== undefined ||
    sanitized.category !== undefined;

  return hasChange ? sanitized : null;
}

export function validateFixAgainstStore(
  store: StoreSnapshot,
  changes: ProductFieldChange
): { ok: true; productTitle: string } | { ok: false; reason: string } {
  const product = store.products.find((p) => p.id === changes.productId);
  if (!product) {
    return { ok: false, reason: "Product not found in store" };
  }

  const isNoOp =
    (changes.title === undefined || changes.title === product.title) &&
    (changes.description === undefined ||
      changes.description === (product.description ?? "")) &&
    (changes.altText === undefined ||
      changes.altText === (product.altText ?? "")) &&
    (changes.category === undefined ||
      changes.category === (product.category ?? ""));

  if (isNoOp) {
    return { ok: false, reason: "Fix would not change any product fields" };
  }

  return { ok: true, productTitle: product.title };
}
