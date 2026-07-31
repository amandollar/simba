import { z } from "zod";

export const issueDraftSchema = z.object({
  category: z.enum(["ux", "seo", "accessibility", "conversion", "trust"]),
  title: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(["critical", "high", "medium", "low"]),
  confidence: z.number().min(0).max(1),
  effort: z.enum(["low", "medium", "high"]),
  canAutofix: z.boolean(),
  fixSummary: z.string().nullable().optional(),
});

export const lensResponseSchema = z.object({
  issues: z.array(issueDraftSchema).max(8),
});

export const triageResponseSchema = z.object({
  issues: z.array(issueDraftSchema).max(20),
  droppedCount: z.number().int().min(0).optional(),
});

export const strategistResponseSchema = z.object({
  insight: z.string().min(1).max(500),
});

export const consultantRouterSchema = z.object({
  intent: z.enum([
    "priorities",
    "sales",
    "catalog",
    "launch",
    "audit",
    "general",
  ]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional(),
});

export const fixProposalSchema = z.object({
  recommendation: z.string().min(1),
  canApply: z.boolean(),
  changes: z
    .object({
      productId: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      altText: z.string().optional(),
      category: z.string().optional(),
    })
    .optional(),
});

export const fixValidationSchema = z.object({
  approved: z.boolean(),
  note: z.string().optional(),
});

export const copyOptimizationSchema = z.object({
  summary: z.string().min(1),
  copyScore: z.object({
    before: z.number().min(1).max(10),
    after: z.number().min(1).max(10),
  }),
  improvements: z.array(z.string()).min(1).max(6),
  changes: z.object({
    productId: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    altText: z.string().optional(),
    category: z.string().optional(),
  }),
});

export const growthActionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  impact: z.enum(["high", "medium", "low"]),
  category: z.enum([
    "retention",
    "acquisition",
    "conversion",
    "trust",
    "catalog",
  ]),
  rationale: z.string().min(1),
  evidence: z.array(z.string()).min(1).max(3),
  timeframe: z.enum(["today", "this_week", "this_month"]),
  steps: z.array(z.string()).min(1).max(4),
  productIds: z.array(z.string()).max(3).optional(),
  relatedIssueTitle: z.string().optional(),
  emailDraft: z
    .object({
      subject: z.string().min(1),
      body: z.string().min(1),
      audience: z.string().min(1),
      sendWhen: z.string().optional(),
    })
    .optional(),
  inAppAction: z
    .enum(["fixes", "products", "launch", "consultant", "scan", "product_edit"])
    .optional(),
});

export const growthPlanSchema = z.object({
  headline: z.string().min(1).max(200),
  summary: z.string().min(1),
  focusThisWeek: z.string().min(1),
  quickWin: z.string().min(1),
  actions: z.array(growthActionSchema).min(2).max(5),
});
