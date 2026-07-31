import type { IssueDraft } from "../../lib/scoring.js";
import type { StoreSnapshot } from "../../lib/store-snapshot.js";

export type ConsultantIntent =
  | "priorities"
  | "sales"
  | "catalog"
  | "launch"
  | "audit"
  | "general";

export const CONSULTANT_SPECIALIST_LABELS: Record<ConsultantIntent, string> = {
  priorities: "Priority advisor",
  sales: "Sales advisor",
  catalog: "Catalog advisor",
  launch: "Launch advisor",
  audit: "Audit advisor",
  general: "Simba",
};

export interface AuditAgentResult {
  issues: IssueDraft[];
  insight: string | null;
  meta: {
    lensIssueCount: number;
    rulesIssueCount: number;
    triageApplied: boolean;
  };
}

export interface ConsultantContext {
  message: string;
  store: StoreSnapshot;
  storeSummary: ReturnType<
    typeof import("../../lib/store-snapshot.js").buildConsultantStoreSummary
  >;
  audit: {
    overallScore: number;
    scores: unknown;
    auditedAt: Date;
    openIssueCount: number;
    resolvedCount: number;
    dismissedCount: number;
    topIssues: Array<{
      title: string;
      category: string;
      severity: string;
      effort: string;
      canAutofix: boolean;
      fixSummary: string | null;
      description: string;
      priority: number;
    }>;
  } | null;
  recentFixes: unknown[];
}

export interface ConsultantResponse {
  reply: string;
  specialist: ConsultantIntent;
}

export interface FixProposal {
  recommendation: string;
  canApply: boolean;
  changes?: {
    productId: string;
    title?: string;
    description?: string;
    altText?: string;
    category?: string;
  };
}

export interface FixValidation {
  approved: boolean;
  note?: string;
}

export interface FixResultMeta {
  validatorApproved: boolean;
  validatorNote?: string;
  rescanScheduled?: boolean;
  productId?: string;
  productTitle?: string;
  remainingCount?: number;
}

export interface FixOrchestratorResult extends FixProposal {
  proof?: ReturnType<
    typeof import("../../lib/audit-diff.js").serializeFixProof
  > | null;
  meta: FixResultMeta;
}

export interface CopyOptimizationResult {
  summary: string;
  copyScore: { before: number; after: number };
  improvements: string[];
  changes: {
    productId: string;
    title?: string;
    description?: string;
    altText?: string;
    category?: string;
  };
  applied?: boolean;
  productTitle?: string;
}

export type GrowthActionCategory =
  | "retention"
  | "acquisition"
  | "conversion"
  | "trust"
  | "catalog";

export type GrowthInAppAction =
  | "fixes"
  | "products"
  | "launch"
  | "consultant"
  | "scan"
  | "product_edit";

export interface GrowthAction {
  id: string;
  title: string;
  impact: "high" | "medium" | "low";
  category: GrowthActionCategory;
  rationale: string;
  evidence: string[];
  timeframe: "today" | "this_week" | "this_month";
  steps: string[];
  productIds?: string[];
  relatedIssueTitle?: string;
  relatedIssueId?: string;
  relatedIssueCanAutofix?: boolean;
  emailDraft?: {
    subject: string;
    body: string;
    audience: string;
    sendWhen?: string;
  };
  inAppAction?: GrowthInAppAction;
}

export type GrowthStoreStage =
  | "pre_launch"
  | "launched_no_sales"
  | "early_traction"
  | "growing";

export interface GrowthSignal {
  label: string;
  value: string;
  tone: "good" | "warn" | "neutral";
}

export interface GrowthPlan {
  headline: string;
  summary: string;
  focusThisWeek: string;
  quickWin: string;
  actions: GrowthAction[];
  generatedAt: string;
  storeStage: GrowthStoreStage;
  stageLabel: string;
  stageDescription: string;
  signals: GrowthSignal[];
  opportunities: string[];
}

export interface StoredGrowthPlan extends GrowthPlan {
  id: string;
  completedActionIds: string[];
}

export interface GrowthPlanSummary {
  id: string;
  headline: string;
  stageLabel: string;
  generatedAt: string;
  completedCount: number;
  actionCount: number;
}
