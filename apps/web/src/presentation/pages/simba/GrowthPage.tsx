import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  useGrowthActionToggle,
  useGrowthPlan,
  useGrowthPlanHistory,
  useLatestGrowthPlan,
  useMerchant,
} from "@/application/hooks";
import { buildIssueFixHref } from "@/domain/issue-fix-link";
import type {
  GrowthAction,
  GrowthInAppAction,
  GrowthPlanSummary,
  GrowthSignal,
  StoredGrowthPlan,
} from "@/domain/types";
import { Badge } from "@/presentation/components/ui/Badge";
import { Button } from "@/presentation/components/ui/Button";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import {
  Icon,
  Check,
  Copy,
  History,
  IconBox,
  Sparkles,
  Target,
  TrendingUp,
  Wand2,
} from "@/presentation/components/ui/Icon";
import { SimbaSectionHeader } from "@/presentation/components/simba/SimbaSectionHeader";
import { Banner, EmptyState, ErrorState } from "@/presentation/components/ui/States";
import { GrowthPageSkeleton } from "@/presentation/components/ui/PageSkeletons";
import { growthApi } from "@/infrastructure/api";

const IMPACT_LABELS = {
  high: "High impact",
  medium: "Medium impact",
  low: "Quick win",
} as const;

const CATEGORY_LABELS = {
  retention: "Retention",
  acquisition: "Acquisition",
  conversion: "Conversion",
  trust: "Trust",
  catalog: "Catalog",
} as const;

const TIMEFRAME_LABELS = {
  today: "Do today",
  this_week: "This week",
  this_month: "This month",
} as const;

const ACTION_LINKS: Record<GrowthInAppAction, { to: string; label: string }> = {
  fixes: { to: "/simba/issues", label: "Open fixes" },
  products: { to: "/products", label: "View catalog" },
  product_edit: { to: "/products", label: "Edit product" },
  launch: { to: "/store", label: "Launch store" },
  consultant: { to: "/simba/consultant", label: "Ask Simba" },
  scan: { to: "/simba", label: "Run scan" },
};

const SIGNAL_TONE_CLASS = {
  good: "border-success/20 bg-success/5 text-success",
  warn: "border-warning/25 bg-warning/5 text-warning",
  neutral: "border-border bg-surface-overlay text-foreground",
} as const;

function ImpactBadge({ impact }: { impact: GrowthAction["impact"] }) {
  const severity =
    impact === "high" ? "critical" : impact === "medium" ? "high" : "medium";
  return <Badge label={IMPACT_LABELS[impact]} severity={severity} />;
}

function SignalCard({ signal }: { signal: GrowthSignal }) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border px-4 py-3 ${SIGNAL_TONE_CLASS[signal.tone]}`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider opacity-80">
        {signal.label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{signal.value}</p>
    </div>
  );
}

function buildProductTitleMap(action: GrowthAction): Map<string, string> {
  const map = new Map<string, string>();
  const text = [...action.evidence, ...action.steps, action.rationale].join(
    " "
  );
  const quoted = [...text.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

  for (const id of action.productIds ?? []) {
    map.set(id, quoted[0] ?? "View product");
  }
  return map;
}

function EmailDraftCard({
  draft,
}: {
  draft: NonNullable<GrowthAction["emailDraft"]>;
}) {
  const [copied, setCopied] = useState(false);
  const fullText = `Subject: ${draft.subject}\n\n${draft.body}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-simba/15 bg-simba-soft/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-simba">
            Ready-to-send email
          </p>
          <p className="mt-1 text-xs text-muted">
            To: {draft.audience}
            {draft.sendWhen ? ` · ${draft.sendWhen}` : ""}
          </p>
        </div>
        <Button type="button" variant="ghost" className="h-8 px-2" onClick={handleCopy}>
          <Icon icon={copied ? Check : Copy} size={14} className="mr-1" />
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="mt-3 text-sm font-medium">{draft.subject}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
        {draft.body}
      </p>
    </div>
  );
}

function GrowthActionCard({
  action,
  productTitles,
  completed,
  toggling,
  onToggleComplete,
}: {
  action: GrowthAction;
  productTitles: Map<string, string>;
  completed: boolean;
  toggling: boolean;
  onToggleComplete: () => void;
}) {
  const linkConfig = action.inAppAction
    ? ACTION_LINKS[action.inAppAction]
    : undefined;

  const productId = action.productIds?.[0];
  const productLink =
    action.inAppAction === "product_edit" && productId
      ? `/products/${productId}/edit?from=/simba/growth`
      : linkConfig?.to;

  const linkLabel =
    action.inAppAction === "product_edit" && productId
      ? `Edit ${productTitles.get(productId) ?? "product"}`
      : linkConfig?.label;

  const fixHref =
    action.relatedIssueId && action.relatedIssueCanAutofix
      ? buildIssueFixHref(action.relatedIssueId)
      : action.relatedIssueId
        ? `/simba/issues?issue=${action.relatedIssueId}`
        : null;

  return (
    <Card className={completed ? "opacity-70" : undefined}>
      <CardBody className="space-y-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onToggleComplete}
            disabled={toggling}
            aria-label={completed ? "Mark action incomplete" : "Mark action complete"}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
              completed
                ? "border-success bg-success text-white"
                : "border-border bg-surface-raised hover:border-simba/40"
            }`}
          >
            {completed && <Icon icon={Check} size={12} />}
          </button>
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <ImpactBadge impact={action.impact} />
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted">
                {CATEGORY_LABELS[action.category]}
              </span>
              <span className="rounded-full border border-simba/20 bg-simba-soft/40 px-2 py-0.5 text-[11px] font-medium text-simba">
                {TIMEFRAME_LABELS[action.timeframe]}
              </span>
              {completed && (
                <span className="text-[11px] font-medium text-success">Done</span>
              )}
            </div>

            <h3
              className={`text-base font-semibold tracking-tight ${
                completed ? "line-through text-muted" : ""
              }`}
            >
              {action.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted">{action.rationale}</p>

            {action.evidence.length > 0 && (
              <ul className="space-y-1.5 rounded-[var(--radius-control)] border border-border bg-surface-overlay/60 px-3 py-2.5">
                {action.evidence.map((fact) => (
                  <li key={fact} className="flex gap-2 text-xs text-muted">
                    <span className="mt-0.5 text-simba">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            )}

            {action.relatedIssueTitle && (
              <p className="text-xs text-muted">
                Tied to audit:{" "}
                <span className="font-medium text-foreground">
                  {action.relatedIssueTitle}
                </span>
              </p>
            )}

            {action.productIds && action.productIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {action.productIds.map((id) => (
                  <Link
                    key={id}
                    to={`/products/${id}/edit?from=/simba/growth`}
                    className="rounded-full border border-border bg-surface-raised px-2.5 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:border-simba/30 hover:text-simba"
                  >
                    {productTitles.get(id) ?? "Product"}
                  </Link>
                ))}
              </div>
            )}

            <ol className="space-y-2">
              {action.steps.map((step, index) => (
                <li key={step} className="flex gap-2 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-simba-soft text-[11px] font-semibold text-simba">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            {action.emailDraft && <EmailDraftCard draft={action.emailDraft} />}

            <div className="flex flex-wrap gap-2">
              {fixHref && (
                <Link to={fixHref}>
                  <Button variant="primary" className="w-full sm:w-auto">
                    <Icon icon={Wand2} size={14} className="mr-1.5" />
                    {action.relatedIssueCanAutofix ? "Apply fix" : "View issue"}
                  </Button>
                </Link>
              )}
              {productLink && linkLabel && (
                <Link to={productLink}>
                  <Button variant="secondary" className="w-full sm:w-auto">
                    {linkLabel}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function StoreStageBanner({ plan }: { plan: StoredGrowthPlan }) {
  return (
    <Card className="border-simba/20 bg-gradient-to-br from-simba-soft/50 to-surface-raised">
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-simba/25 bg-simba/10 px-2.5 py-0.5 text-xs font-semibold text-simba">
            {plan.stageLabel}
          </span>
          <span className="text-xs text-muted">{plan.stageDescription}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{plan.headline}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{plan.summary}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {plan.signals.map((signal) => (
            <SignalCard key={signal.label} signal={signal} />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function PlanHistoryPanel({
  history,
  activePlanId,
  loading,
  onSelect,
}: {
  history: GrowthPlanSummary[];
  activePlanId?: string;
  loading: boolean;
  onSelect: (id: string) => void;
}) {
  if (loading && history.length === 0) return null;
  if (history.length <= 1) return null;

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon icon={History} size={16} className="text-simba" />
          <h3 className="text-sm font-medium">Plan history</h3>
        </div>
        <ul className="space-y-2">
          {history.map((entry) => {
            const active = entry.id === activePlanId;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onSelect(entry.id)}
                  className={`w-full rounded-[var(--radius-control)] border px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "border-simba/30 bg-simba-soft/30"
                      : "border-border bg-surface-overlay hover:border-simba/20"
                  }`}
                >
                  <p className="text-sm font-medium leading-snug">{entry.headline}</p>
                  <p className="mt-1 text-xs text-muted">
                    {entry.stageLabel} ·{" "}
                    {new Date(entry.generatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {entry.completedCount}/{entry.actionCount} done
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}

export function GrowthPage() {
  const { data: merchant } = useMerchant();
  const {
    data: latestPlan,
    loading: loadingLatest,
    reload: reloadLatest,
  } = useLatestGrowthPlan();
  const { data: history, reload: reloadHistory } = useGrowthPlanHistory();
  const { mutate: generatePlan, loading: generating, error } = useGrowthPlan();
  const [plan, setPlan] = useState<StoredGrowthPlan | null>(null);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [togglingActionId, setTogglingActionId] = useState<string | null>(null);
  const [planLoadError, setPlanLoadError] = useState<string | null>(null);

  const { mutate: toggleAction, error: toggleError } = useGrowthActionToggle((updated) => {
    setPlan(updated);
    reloadHistory();
  });

  useEffect(() => {
    if (latestPlan) setPlan(latestPlan);
  }, [latestPlan]);

  async function handleGenerate() {
    const result = await generatePlan();
    if (result) {
      setPlan(result);
      reloadLatest();
      reloadHistory();
    }
  }

  async function handleSelectPlan(planId: string) {
    if (plan?.id === planId) return;
    setLoadingPlanId(planId);
    setPlanLoadError(null);
    try {
      const selected = await growthApi.getPlan(planId);
      setPlan(selected);
    } catch (err) {
      setPlanLoadError(
        err instanceof Error ? err.message : "Couldn't load that plan."
      );
    } finally {
      setLoadingPlanId(null);
    }
  }

  async function handleToggleAction(actionId: string) {
    if (!plan) return;
    setTogglingActionId(actionId);
    await toggleAction(plan.id, actionId);
    setTogglingActionId(null);
  }

  const hasStoreData = Boolean(merchant);
  const loading = (loadingLatest && !plan) || generating;
  const completedCount = plan?.completedActionIds.length ?? 0;
  const totalActions = plan?.actions.length ?? 0;
  const progress =
    totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0;

  return (
    <div className="space-y-5">
      <SimbaSectionHeader
        title="Growth"
        description="Built from your orders, catalog, customers, and audit — track progress and apply fixes in one click."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-simba/20 bg-simba-soft/30 px-3 py-1 text-xs font-medium text-simba">
            <Icon icon={TrendingUp} size={14} />
            Growth agent
          </span>
        }
        action={
          <Button
            variant="simba"
            onClick={handleGenerate}
            disabled={loading || !hasStoreData}
          >
            <Icon icon={Sparkles} size={16} className="mr-1.5" />
            {generating ? "Analyzing store…" : plan ? "Refresh plan" : "Generate plan"}
          </Button>
        }
      />

      {error && <ErrorState message={error} onRetry={handleGenerate} />}

      {planLoadError && (
        <Banner variant="error" onDismiss={() => setPlanLoadError(null)}>
          {planLoadError}
        </Banner>
      )}

      {toggleError && (
        <Banner variant="error">{toggleError}</Banner>
      )}

      {!plan && !loading && !error && (
        <EmptyState
          icon={<IconBox icon={TrendingUp} />}
          title="No plan yet"
          message="Simba will detect your store stage, spot catalog gaps, and draft campaigns with real product names and customer counts."
          action={
            <Button
              variant="simba"
              onClick={handleGenerate}
              disabled={!hasStoreData}
            >
              <Icon icon={Sparkles} size={16} className="mr-1.5" />
              Generate plan
            </Button>
          }
        />
      )}

      {loading && !plan && <GrowthPageSkeleton />}

      {plan && (
        <>
          {totalActions > 0 && (
            <div className="rounded-[var(--radius-card)] border border-border bg-surface-raised px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">
                  {completedCount} of {totalActions} actions complete
                </span>
                <span className="text-muted">{progress}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-overlay">
                <div
                  className="h-full rounded-full bg-simba transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <StoreStageBanner plan={plan} />

          <PlanHistoryPanel
            history={history ?? []}
            activePlanId={plan.id}
            loading={loadingPlanId !== null}
            onSelect={handleSelectPlan}
          />

          {plan.opportunities.length > 0 && (
            <Card>
              <CardBody className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon icon={Target} size={16} className="text-simba" />
                  <h3 className="text-sm font-medium">Detected opportunities</h3>
                </div>
                <ul className="space-y-2">
                  {plan.opportunities.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-muted">
                      <span className="text-simba">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          <div className="rounded-[var(--radius-card)] border border-simba/25 bg-simba-soft/30 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-simba">
              Focus this week
            </p>
            <p className="mt-1 text-sm font-medium">{plan.focusThisWeek}</p>
          </div>

          <div className="rounded-[var(--radius-control)] border border-border bg-surface-raised px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Quick win (under 15 min)
            </p>
            <p className="mt-1 text-sm">{plan.quickWin}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium">Action plan</h3>
              <p className="text-xs text-muted">
                {new Date(plan.generatedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
            {plan.actions.map((action) => (
              <GrowthActionCard
                key={action.id}
                action={action}
                productTitles={buildProductTitleMap(action)}
                completed={plan.completedActionIds.includes(action.id)}
                toggling={togglingActionId === action.id}
                onToggleComplete={() => handleToggleAction(action.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
