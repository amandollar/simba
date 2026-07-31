import type { StoreBranding } from "@/domain/branding";

export interface Merchant {
  id: string;
  clerkUserId: string;
  name: string;
  slug: string;
  description: string | null;
  branding: StoreBranding | null;
  launchedAt: string | null;
  createdAt: string;
}

export type IssueCategory =
  | "ux"
  | "seo"
  | "accessibility"
  | "conversion"
  | "trust";

export type IssueSeverity = "critical" | "high" | "medium" | "low";
export type IssueStatus = "open" | "resolved" | "dismissed";
export type IssueEffort = "low" | "medium" | "high";

export interface Product {
  id: string;
  merchantId: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  images: string[];
  altText: string | null;
  createdAt: string;
}

export interface Customer {
  id: string;
  merchantId: string;
  name: string;
  email: string;
  orderCount?: number;
  totalSpent?: number;
  lastOrderAt?: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: {
    id: string;
    title: string;
    images?: string[];
    category?: string | null;
  };
}

export interface Order {
  id: string;
  merchantId: string;
  customerId: string;
  total: number;
  status: string;
  createdAt: string;
  customer?: { name: string; email: string };
  items?: OrderItem[];
}

export interface Review {
  id: string;
  productId: string;
  authorName: string | null;
  rating: number;
  body: string;
  createdAt: string;
  product?: { id: string; title: string };
}

export interface PublicStore {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  branding: StoreBranding | null;
  launchedAt: string | null;
  products: Array<{
    id: string;
    title: string;
    description: string | null;
    price: number;
    category: string | null;
    images: string[];
    altText: string | null;
  }>;
}

export interface StoreAnalytics {
  revenue: number;
  orderCount: number;
  customerCount: number;
  productCount: number;
  reviewCount: number;
  avgOrderValue: number;
  topProducts: Array<{
    id: string;
    title: string;
    unitsSold: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    itemCount: number;
  }>;
}

export interface PublicProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  images: string[];
  altText: string | null;
  merchant: { name: string; slug: string };
  reviews: Review[];
  avgRating: number | null;
}

export interface Issue {
  id: string;
  auditId: string;
  category: IssueCategory;
  title: string;
  description: string;
  severity: IssueSeverity;
  confidence: number;
  effort: IssueEffort;
  canAutofix: boolean;
  fixSummary: string | null;
  status: IssueStatus;
  createdAt: string;
}

export interface AuditScores {
  ux: number;
  seo: number;
  accessibility: number;
  conversion: number;
  trust: number;
}

export interface Audit {
  id: string;
  merchantId: string;
  overallScore: number;
  scores: AuditScores;
  insight?: string | null;
  createdAt: string;
  issues?: Issue[];
}

export interface AuditDiffSummary {
  overallDelta: number;
  fixedCount: number;
  newCount: number;
  recurringCount: number;
  fixesAppliedCount: number;
}

export interface DiffIssue {
  title: string;
  category: IssueCategory;
  severity: IssueSeverity;
}

export interface FixProof {
  id: string;
  issueTitle: string;
  productTitle: string | null;
  changes: Record<string, { before: string | null; after: string }>;
  appliedAt: string;
}

export interface AuditDiff {
  hasPrevious: boolean;
  previous: {
    id: string;
    overallScore: number;
    createdAt: string;
  } | null;
  current: {
    id: string;
    overallScore: number;
    createdAt: string;
  };
  overallDelta: number;
  categoryDeltas: AuditScores;
  fixedIssues: DiffIssue[];
  newIssues: DiffIssue[];
  recurringIssues: DiffIssue[];
  fixesApplied: FixProof[];
  summary: {
    fixedCount: number;
    newCount: number;
    recurringCount: number;
    fixesAppliedCount: number;
  };
}

export interface AuditSummary {
  id: string;
  overallScore: number;
  scores: AuditScores;
  createdAt: string;
  diffSummary: AuditDiffSummary | null;
}

export interface AuditRunResult extends Audit {
  diff: AuditDiff | null;
}

export type AuditRescanStatus = {
  status: "idle" | "scheduled" | "running";
  reason?: string;
  startsInMs?: number;
  justCompleted: boolean;
  lastCompletedAt: string | null;
};

export interface FixResultMeta {
  validatorApproved: boolean;
  validatorNote?: string;
  rescanScheduled?: boolean;
  productId?: string;
  productTitle?: string;
  remainingCount?: number;
}

export interface FixResult {
  recommendation: string;
  canApply: boolean;
  changes?: ProductFieldChanges;
  proof?: FixProof | null;
  meta?: FixResultMeta;
}

export interface ProductFieldChanges {
  productId: string;
  title?: string;
  description?: string;
  altText?: string;
  category?: string;
}

export interface CopyOptimizationResult {
  summary: string;
  copyScore: { before: number; after: number };
  improvements: string[];
  changes: ProductFieldChanges;
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

export type ConsultantSpecialist =
  | "priorities"
  | "sales"
  | "catalog"
  | "launch"
  | "audit"
  | "general";

export const CONSULTANT_SPECIALIST_LABELS: Record<ConsultantSpecialist, string> = {
  priorities: "What to fix first",
  sales: "Sales & orders",
  catalog: "Products & catalog",
  launch: "Launch readiness",
  audit: "Your scan results",
  general: "Simba",
};

export interface ConsultantReply {
  reply: string;
  specialist?: ConsultantSpecialist;
}

export interface HealthStatus {
  status: string;
}
