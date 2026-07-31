import { scheduleAuditRescan } from "../../lib/audit-rescan.js";
import { db } from "../../lib/db.js";
import {
  sanitizeProductChanges,
  validateFixAgainstStore,
  type ProductFieldChange,
} from "../../lib/fix-validation.js";
import { getStoreSnapshot } from "../../lib/store-snapshot.js";
import type { CopyOptimizationResult } from "../core/types.js";
import { runCopyAgent } from "../specialists/copy-agent.js";

const PRODUCT_FIELDS = ["title", "description", "altText", "category"] as const;

export async function runCopyOrchestrator(
  merchantId: string,
  productId: string,
  options?: { apply?: boolean; changes?: ProductFieldChange }
): Promise<CopyOptimizationResult> {
  const store = await getStoreSnapshot(merchantId);
  const product = store.products.find((p) => p.id === productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (options?.apply && options.changes) {
    const sanitized = sanitizeProductChanges(options.changes);
    if (!sanitized) {
      throw new Error("No valid product changes to apply");
    }
    if (sanitized.productId !== productId) {
      throw new Error("Changes do not match this product");
    }

    const validation = validateFixAgainstStore(store, sanitized);
    if (!validation.ok) {
      throw new Error(validation.reason);
    }

    const updateData: Record<string, string> = {};
    for (const field of PRODUCT_FIELDS) {
      const value = sanitized[field];
      if (value !== undefined) {
        updateData[field] = value;
      }
    }

    await db.product.update({
      where: { id: productId },
      data: updateData,
    });

    scheduleAuditRescan(merchantId, "copy-optimized", "priority");

    return {
      summary: "Copy updates applied.",
      copyScore: { before: 0, after: 0 },
      improvements: [],
      changes: sanitized,
      applied: true,
      productTitle: validation.productTitle,
    };
  }

  const result = await runCopyAgent(product, store);

  if (result.changes.productId !== productId) {
    result.changes.productId = productId;
  }

  const sanitized = sanitizeProductChanges(result.changes);
  if (!sanitized) {
    throw new Error("Copy agent did not produce any improvements");
  }

  const validation = validateFixAgainstStore(store, sanitized);
  if (!validation.ok) {
    throw new Error(validation.reason);
  }

  return {
    ...result,
    changes: sanitized,
    productTitle: product.title,
  };
}
