import { callChatJSON } from "../../../lib/ai-call.js";
import {
  sanitizeProductChanges,
  validateFixAgainstStore,
  type ProductFieldChange,
} from "../../../lib/fix-validation.js";
import type { StoreSnapshot } from "../../../lib/store-snapshot.js";
import { fixValidationSchema } from "../../core/schemas.js";
import type { FixProposal, FixValidation } from "../../core/types.js";

function deterministicValidate(
  store: StoreSnapshot,
  changes: ProductFieldChange
): FixValidation {
  const result = validateFixAgainstStore(store, changes);
  if (!result.ok) {
    return { approved: false, note: result.reason };
  }
  return { approved: true, note: "Changes pass safety checks." };
}

export async function runFixValidatorAgent(
  issue: {
    title: string;
    description: string;
    category: string;
  },
  store: StoreSnapshot,
  proposal: FixProposal
): Promise<FixValidation> {
  if (!proposal.canApply || !proposal.changes) {
    return {
      approved: true,
      note: "Manual fix — no product changes to validate.",
    };
  }

  const sanitized = sanitizeProductChanges(proposal.changes);
  if (!sanitized) {
    return {
      approved: false,
      note: "Proposed changes were empty or invalid after sanitization.",
    };
  }

  const deterministic = deterministicValidate(store, sanitized);
  if (!deterministic.approved) {
    return deterministic;
  }

  const product = store.products.find((p) => p.id === sanitized.productId);
  const prompt = `You are Simba's fix validator agent — a cautious QA reviewer.

Review whether this proposed autofix correctly addresses the issue without harming the store.

Reject if:
- Fix does not address the issue
- New copy is generic, placeholder-like, or worse than before
- Wrong product targeted
- Category name is vague (e.g. "Misc") when a better fit exists
- Changes are no-ops or trivial rewording with no benefit

Approve if the fix is specific, accurate, and improves the listing.

Return JSON only: { "approved": true, "note": "brief reason" }

ISSUE:
${JSON.stringify(issue, null, 2)}

PRODUCT BEFORE:
${JSON.stringify(
  product
    ? {
        id: product.id,
        title: product.title,
        description: product.description,
        altText: product.altText,
        category: product.category,
      }
    : null,
  null,
  2
)}

PROPOSED CHANGES:
${JSON.stringify(sanitized, null, 2)}

RECOMMENDATION:
${proposal.recommendation}`;

  try {
    const parsed = await callChatJSON({
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      parse: (data) => fixValidationSchema.parse(data),
    });

    return {
      approved: parsed.approved,
      note: parsed.note?.trim(),
    };
  } catch (err) {
    console.warn(
      "[fix-validator-agent] AI review failed, using deterministic result:",
      err instanceof Error ? err.message : err
    );
    return deterministic;
  }
}
