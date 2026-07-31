import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  Check,
  Icon,
  Search,
  Shield,
  ShoppingCart,
  Sparkles,
  Store,
  Target,
} from "@/presentation/components/ui/Icon";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import { SimbaLogo } from "@/presentation/components/ui/SimbaLogo";

export const AUDIT_PIPELINE_STEPS: {
  label: string;
  detail: string;
  icon: LucideIcon;
  agent?: boolean;
}[] = [
  {
    label: "Reading your store",
    detail: "Catalog, orders, and storefront",
    icon: Store,
  },
  {
    label: "UX Lens",
    detail: "Layout, clarity, and mobile flow",
    icon: Sparkles,
    agent: true,
  },
  {
    label: "SEO Lens",
    detail: "Titles, categories, structure",
    icon: Search,
    agent: true,
  },
  {
    label: "Accessibility Lens",
    detail: "Alt text, labels, readability",
    icon: Accessibility,
    agent: true,
  },
  {
    label: "Conversion Lens",
    detail: "Checkout path, copy, pricing",
    icon: ShoppingCart,
    agent: true,
  },
  {
    label: "Trust Lens",
    detail: "Reviews, proof, credibility",
    icon: Shield,
    agent: true,
  },
  {
    label: "Triage agent",
    detail: "Merging duplicate findings",
    icon: Target,
    agent: true,
  },
  {
    label: "Strategist",
    detail: "Prioritizing your action plan",
    icon: Sparkles,
    agent: true,
  },
];

const LENS_STEPS = AUDIT_PIPELINE_STEPS.slice(1, 6);

interface AuditScanExperienceProps {
  stepIndex: number;
  progress: number;
  isFinishing?: boolean;
  isCompleting?: boolean;
  isBackgrounded?: boolean;
  storeName?: string;
  productCount?: number;
}

export function AuditScanExperience({
  stepIndex,
  progress,
  isFinishing = false,
  isCompleting = false,
  isBackgrounded = false,
  storeName,
  productCount,
}: AuditScanExperienceProps) {
  const current = AUDIT_PIPELINE_STEPS[stepIndex] ?? AUDIT_PIPELINE_STEPS[0];
  const activeLensIndex =
    stepIndex >= 1 && stepIndex <= 5 ? stepIndex - 1 : -1;
  const lensesComplete = stepIndex > 5 || isCompleting;

  const title = isCompleting ? "Scan complete" : "Audit in progress";
  const stepDetail = isCompleting
    ? "Your score and fix list are ready"
    : isFinishing
      ? "Almost done — final review can take a little longer"
      : current.detail;
  const footnote = isCompleting
    ? "Opening your results…"
    : isBackgrounded
      ? "Still scanning in the background — you can switch tabs safely."
      : isFinishing
        ? "Hang tight — we're wrapping up your score and fix list."
        : "Specialist agents are reviewing your storefront — usually 30–90 seconds.";

  return (
    <Card
      className={
        isCompleting
          ? "border-success/30 bg-success/5"
          : "border-simba/20 bg-simba-soft/30"
      }
    >
      <CardBody className="space-y-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-card)] border bg-surface-raised ${
              isCompleting ? "border-success/30" : "border-border"
            }`}
          >
            {isCompleting ? (
              <Icon icon={Check} size={22} className="text-success" />
            ) : (
              <SimbaLogo size={28} className="rounded-md" />
            )}
            {!isCompleting && (
              <span
                className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-simba ring-2 ring-surface-raised"
                aria-hidden
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-simba opacity-60" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-0.5 text-sm text-muted">
              {storeName ? `Scanning ${storeName}` : "Scanning your store"}
              {productCount !== undefined && productCount > 0
                ? ` · ${productCount} products`
                : ""}
            </p>
          </div>
          <span
            className={`shrink-0 text-sm font-semibold tabular-nums ${
              isCompleting ? "text-success" : "text-simba"
            }`}
          >
            {progress}%
          </span>
        </div>

        <div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-overlay">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isCompleting
                  ? "bg-success"
                  : `bg-simba ${isFinishing ? "animate-pulse" : ""}`
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {isCompleting ? "All done" : current.label}
              </p>
              <p className="mt-0.5 text-xs text-muted">{stepDetail}</p>
            </div>
            {!isCompleting && (
              <p className="shrink-0 text-xs text-muted">
                Step {stepIndex + 1} of {AUDIT_PIPELINE_STEPS.length}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {LENS_STEPS.map((lens, i) => {
            const active = !isCompleting && i === activeLensIndex;
            const done =
              lensesComplete || (activeLensIndex >= 0 && i < activeLensIndex);

            return (
              <span
                key={lens.label}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "border-simba/30 bg-simba text-white"
                    : done
                      ? "border-border bg-surface-raised text-muted"
                      : "border-border bg-surface-raised/60 text-muted/70"
                }`}
              >
                {done ? (
                  <Icon icon={Check} size={12} className="text-success" />
                ) : (
                  <Icon icon={lens.icon} size={12} />
                )}
                {lens.label.replace(" Lens", "")}
              </span>
            );
          })}
        </div>

        <p className="text-xs text-muted">{footnote}</p>
      </CardBody>
    </Card>
  );
}
