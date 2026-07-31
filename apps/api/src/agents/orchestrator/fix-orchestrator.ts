import { scheduleAuditRescan } from "../../lib/audit-rescan.js";
import { serializeFixProof } from "../../lib/audit-diff.js";
import { db } from "../../lib/db.js";
import {
  sanitizeProductChanges,
  validateFixAgainstStore,
  type ProductFieldChange,
} from "../../lib/fix-validation.js";
import { getAffectedProducts } from "../../lib/issue-affected.js";
import { getStoreSnapshot } from "../../lib/store-snapshot.js";
import type { FixOrchestratorResult, FixProposal } from "../core/types.js";
import { runFixGeneratorAgent } from "../specialists/fix/fix-generator-agent.js";
import { runFixValidatorAgent } from "../specialists/fix/fix-validator-agent.js";

const PRODUCT_FIELDS = ["title", "description", "altText", "category"] as const;

type ProductField = (typeof PRODUCT_FIELDS)[number];

function buildChangeProof(
  before: Record<ProductField, string | null>,
  changes: ProductFieldChange
) {
  const proof: Record<string, { before: string | null; after: string }> = {};

  for (const field of PRODUCT_FIELDS) {
    const after = changes[field];
    if (after === undefined) continue;
    const prior = before[field];
    if (prior === after) continue;
    proof[field] = { before: prior, after };
  }

  return proof;
}

async function generateValidatedProposal(
  issue: {
    title: string;
    description: string;
    category: string;
    fixSummary: string | null;
  },
  store: Awaited<ReturnType<typeof getStoreSnapshot>>,
  targetProductId?: string
) {
  let proposal = await runFixGeneratorAgent(issue, store, {
    productId: targetProductId,
  });
  let validation = await runFixValidatorAgent(issue, store, proposal);

  if (
    !validation.approved &&
    proposal.canApply &&
    proposal.changes
  ) {
    console.info("[fix-orchestrator] retrying after validator rejection");
    proposal = await runFixGeneratorAgent(issue, store, {
      productId: targetProductId,
      feedback: validation.note ?? "Previous fix was rejected.",
    });
    validation = await runFixValidatorAgent(issue, store, proposal);
  }

  if (!validation.approved && proposal.canApply) {
    return {
      proposal: {
        recommendation: `${proposal.recommendation}\n\nNote: Autofix was not approved — ${validation.note ?? "please apply manually."}`,
        canApply: false,
        changes: undefined,
      },
      validation,
    };
  }

  return { proposal, validation };
}

export async function runFixOrchestrator(
  issueId: string,
  apply = false,
  targetProductId?: string,
  approvedChanges?: ProductFieldChange
): Promise<FixOrchestratorResult> {
  const issue = await db.issue.findUniqueOrThrow({
    where: { id: issueId },
    include: {
      audit: {
        select: { merchantId: true },
      },
    },
  });

  const store = await getStoreSnapshot(issue.audit.merchantId);
  const affectedBefore = getAffectedProducts(issue.title, store.products);
  const resolvedProductId =
    targetProductId ??
    approvedChanges?.productId ??
    (affectedBefore.length === 1 ? affectedBefore[0]?.id : undefined);

  if (affectedBefore.length > 1 && !resolvedProductId) {
    throw new Error("Pick a product to fix first");
  }

  const issuePayload = {
    title: issue.title,
    description: issue.description,
    category: issue.category,
    fixSummary: issue.fixSummary,
  };

  let proposal: FixProposal;
  let validation: { approved: boolean; note?: string };

  if (apply && approvedChanges) {
    const sanitized = sanitizeProductChanges(approvedChanges);
    if (!sanitized) {
      throw new Error("Fix contained invalid or empty product changes");
    }
    if (resolvedProductId && sanitized.productId !== resolvedProductId) {
      throw new Error("Fix product does not match the selected product");
    }

    proposal = {
      recommendation: "Applying your reviewed fix.",
      canApply: true,
      changes: sanitized,
    };
    validation = { approved: true, note: "Pre-approved fix from preview." };
  } else {
    const generated = await generateValidatedProposal(
      issuePayload,
      store,
      resolvedProductId
    );
    proposal = generated.proposal;
    validation = generated.validation;
  }

  let proof = null;
  let rescanScheduled = false;

  if (apply && proposal.canApply && proposal.changes) {
    const sanitized = sanitizeProductChanges(proposal.changes);
    if (!sanitized) {
      throw new Error("Fix contained invalid or empty product changes");
    }

    const safety = validateFixAgainstStore(store, sanitized);
    if (!safety.ok) {
      throw new Error(safety.reason);
    }

    const existing = await db.product.findFirst({
      where: { id: sanitized.productId, merchantId: issue.audit.merchantId },
    });

    if (!existing) {
      throw new Error("Product not found");
    }

    const before: Record<ProductField, string | null> = {
      title: existing.title,
      description: existing.description,
      altText: existing.altText,
      category: existing.category,
    };

    const changeProof = buildChangeProof(before, sanitized);
    const { productId, title, description, altText, category } = sanitized;

    await db.product.update({
      where: { id: productId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(altText !== undefined && { altText }),
        ...(category !== undefined && { category }),
      },
    });

    const remainingCount = Math.max(
      0,
      affectedBefore.filter((p) => p.id !== productId).length
    );
    const isBulkIssue = affectedBefore.length > 1;

    if (!isBulkIssue) {
      await db.issue.update({
        where: { id: issueId },
        data: { status: "resolved" },
      });
    }

    if (Object.keys(changeProof).length > 0) {
      const record = await db.fixApplication.create({
        data: {
          merchantId: issue.audit.merchantId,
          issueId,
          issueTitle: issue.title,
          productId,
          productTitle: existing.title,
          changes: changeProof,
        },
      });
      proof = serializeFixProof(record);
    }

    scheduleAuditRescan(issue.audit.merchantId, "fix-applied", "priority");
    rescanScheduled = true;

    return {
      ...proposal,
      proof,
      meta: {
        validatorApproved: validation.approved,
        validatorNote: validation.note,
        rescanScheduled,
        productId,
        productTitle: existing.title,
        remainingCount,
      },
    };
  }

  const previewProduct = resolvedProductId
    ? store.products.find((p) => p.id === resolvedProductId)
    : undefined;

  console.info("[fix-orchestrator]", {
    issueId,
    canApply: proposal.canApply,
    validatorApproved: validation.approved,
    applied: apply && proposal.canApply,
    targetProductId: resolvedProductId,
  });

  return {
    ...proposal,
    proof,
    meta: {
      validatorApproved: validation.approved,
      validatorNote: validation.note,
      rescanScheduled,
      productId: previewProduct?.id,
      productTitle: previewProduct?.title,
      remainingCount: affectedBefore.length > 1 ? affectedBefore.length : undefined,
    },
  };
}
