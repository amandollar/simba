import type { LucideIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useLatestAudit,
  useLaunchReadiness,
  useMerchant,
  useAnalytics,
  useAuditDiff,
  useAuditRescanWatch,
  useProducts,
  useAuditScanFlow,
} from "@/application/hooks";
import type { AuditDiff, AuditRunResult } from "@/domain/types";
import { rescanReasonLabel } from "@/domain/audit-rescan";
import { getIssueAction } from "@/domain/issue-actions";
import { normalizeScores, formatMoney } from "@/domain/helpers";
import { LaunchChecklist } from "@/presentation/components/dashboard/LaunchChecklist";
import { sortIssuesByPriority } from "@/domain/issues";
import { getScoreTier } from "@/domain/scores";
import type { AuditScores, Issue, Product } from "@/domain/types";
import { ScoreBar, ScoreRing } from "@/presentation/components/dashboard/ScoreCard";
import { Badge } from "@/presentation/components/ui/Badge";
import { Button } from "@/presentation/components/ui/Button";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import {
  Accessibility,
  ChevronDown,
  Icon,
  IconBox,
  Search,
  Shield,
  ShoppingCart,
  Sparkles,
} from "@/presentation/components/ui/Icon";
import {
  Banner,
  EmptyState,
  ErrorState,
} from "@/presentation/components/ui/States";
import { AuditOverviewSkeleton } from "@/presentation/components/ui/PageSkeletons";
import { AuditDiffCard } from "@/presentation/components/simba/AuditDiffCard";
import {
  AuditScanExperience,
} from "@/presentation/components/simba/AuditScanExperience";

const scoreCategories: {
  key: keyof AuditScores;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "ux", label: "UX", icon: Sparkles },
  { key: "seo", label: "SEO", icon: Search },
  { key: "accessibility", label: "Accessibility", icon: Accessibility },
  { key: "conversion", label: "Conversion", icon: ShoppingCart },
  { key: "trust", label: "Trust", icon: Shield },
];

function buildInsight(audit: { insight?: string | null } | null, openIssues: Issue[]) {
  if (audit?.insight?.trim()) {
    return audit.insight.trim();
  }

  if (!openIssues.length) {
    return "Your store looks healthy. Run another scan after you make changes.";
  }

  const top = openIssues[0];
  return `Start with **${top.title}** — ${top.fixSummary ?? "your highest-impact fix right now."}`;
}

export function SimbaOverviewPage() {
  const { data: audit, loading, error, reload } = useLatestAudit();
  const { data: merchant } = useMerchant();
  const notLaunched = Boolean(merchant && !merchant.launchedAt);
  const { data: launchReadiness } = useLaunchReadiness(notLaunched);
  const { data: analytics } = useAnalytics();
  const { data: products } = useProducts();
  const catalog = products ?? [];
  const { data: auditDiff, reload: reloadDiff } = useAuditDiff();
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [latestDiff, setLatestDiff] = useState<AuditDiff | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const handleScanComplete = useCallback(
    async (result: AuditRunResult) => {
      setLatestDiff(result.diff ?? null);
      setRunMessage(
        result.diff?.hasPrevious
          ? `Scan complete — score ${result.diff.overallDelta >= 0 ? "up" : "down"} ${Math.abs(result.diff.overallDelta)} points since last time.`
          : "Scan complete."
      );
      await Promise.all([reload(), reloadDiff()]);
    },
    [reload, reloadDiff]
  );

  const {
    startScan,
    isActive: running,
    stepIndex,
    progress,
    isFinishing,
    isCompleting,
    isBackgrounded,
    error: runError,
  } = useAuditScanFlow({ onComplete: handleScanComplete });

  const handleRescanComplete = useCallback(async () => {
    await Promise.all([reload(), reloadDiff()]);
    setLatestDiff(null);
  }, [reload, reloadDiff]);

  const {
    status: rescanStatus,
    isBackgroundScanning,
    showUpdated,
    dismissUpdated,
  } = useAuditRescanWatch({
    enabled: Boolean(audit) || loading,
    onUpdated: handleRescanComplete,
  });

  const scores = audit ? normalizeScores(audit.scores) : null;
  const openIssues = useMemo(
    () =>
      audit?.issues
        ? sortIssuesByPriority(audit.issues.filter((i) => i.status === "open"))
        : [],
    [audit?.issues]
  );

  const criticalCount = openIssues.filter((i) => i.severity === "critical").length;
  const autofixCount = openIssues.filter((i) => i.canAutofix).length;
  const overallTier = audit ? getScoreTier(audit.overallScore) : null;
  const insight = buildInsight(audit, openIssues);
  const diff = latestDiff ?? auditDiff ?? null;
  const backgroundScanLabel =
    rescanStatus?.status === "running"
      ? "Updating your score…"
      : rescanStatus?.status === "scheduled"
        ? rescanStatus.startsInMs && rescanStatus.startsInMs > 5_000
          ? `Re-scan queued after ${rescanReasonLabel(rescanStatus.reason)}`
          : `Re-scanning after ${rescanReasonLabel(rescanStatus.reason)}…`
        : null;

  async function handleRunAudit() {
    setRunMessage(null);
    await startScan(audit?.id ?? null);
  }

  if (loading && !audit && !running) {
    return <AuditOverviewSkeleton />;
  }

  return (
    <div className="space-y-4">
      {error && !running && <ErrorState message={error} onRetry={reload} />}
      {runError && <Banner variant="error">{runError}</Banner>}
      {showUpdated && !runError && !running && (
        <Banner variant="success">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Score updated — your latest scan is ready.</span>
            <Button variant="ghost" onClick={dismissUpdated}>
              Dismiss
            </Button>
          </div>
        </Banner>
      )}
      {runMessage && !runError && !showUpdated && !running && (
        <Banner variant="success">{runMessage}</Banner>
      )}

      {running && (
        <AuditScanExperience
          stepIndex={stepIndex}
          progress={progress}
          isFinishing={isFinishing}
          isCompleting={isCompleting}
          isBackgrounded={isBackgrounded}
          storeName={merchant?.name}
          productCount={catalog.length}
        />
      )}

      {(isBackgroundScanning && !running) && (
        <Card className="border-simba/20 bg-simba-soft/20">
          <CardBody className="flex items-center gap-3 py-4">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-simba/30 border-t-simba" />
            <p className="text-sm font-medium">
              {backgroundScanLabel ?? "Updating your score…"}
            </p>
          </CardBody>
        </Card>
      )}

      <div
        className={
          running && audit
            ? "pointer-events-none space-y-4 opacity-50 transition-opacity"
            : "space-y-4"
        }
      >
      {!audit && !running ? (
        <EmptyState
          icon={<IconBox icon={Search} />}
          title="No scan yet"
          message="Run a scan to get your store health score and a prioritized fix list."
          action={
            <Button variant="simba" onClick={handleRunAudit} disabled={running}>
              Run scan
            </Button>
          }
        />
      ) : scores && audit && overallTier ? (
        <>
          {notLaunched && launchReadiness && (
            <LaunchChecklist readiness={launchReadiness} compact />
          )}

          <Card>
            <CardBody className="space-y-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex shrink-0 justify-center sm:justify-start">
                  <ScoreRing score={audit.overallScore} size={100} strokeWidth={5} />
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted">
                      Store health
                    </p>
                    <h2 className="text-xl font-semibold tracking-tight">
                      {overallTier.label}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted">
                      Scanned{" "}
                      {new Date(audit.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                    <span>
                      <strong className="font-medium text-foreground">
                        {openIssues.length}
                      </strong>{" "}
                      to fix
                    </span>
                    {criticalCount > 0 && (
                      <span>
                        <strong className="font-medium text-danger">
                          {criticalCount}
                        </strong>{" "}
                        urgent
                      </span>
                    )}
                    {autofixCount > 0 && (
                      <span>
                        <strong className="font-medium text-foreground">
                          {autofixCount}
                        </strong>{" "}
                        quick fixes
                      </span>
                    )}
                    {merchant?.launchedAt && analytics && analytics.orderCount > 0 && (
                      <span>
                        <strong className="font-medium text-foreground">
                          {formatMoney(analytics.revenue, {
                            maximumFractionDigits: 0,
                          })}
                        </strong>{" "}
                        revenue
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="simba"
                      onClick={handleRunAudit}
                      disabled={running || isBackgroundScanning}
                    >
                      {running
                        ? "Scanning…"
                        : isBackgroundScanning
                          ? "Updating…"
                          : "Re-run scan"}
                    </Button>
                    {openIssues.length > 0 && (
                      <Link to="/simba/issues">
                        <Button variant="secondary">View fixes</Button>
                      </Link>
                    )}
                    <Link to="/simba/consultant">
                      <Button variant="ghost">Ask Simba</Button>
                    </Link>
                  </div>
                </div>
              </div>

              {openIssues.length > 0 && (
                <div className="rounded-[var(--radius-card)] border border-simba/15 bg-simba-soft/30 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <Icon icon={Sparkles} size={15} className="mt-0.5 shrink-0 text-simba" />
                    <p className="text-sm leading-relaxed text-muted">
                      {insight.split("**").map((part, i) =>
                        i % 2 === 1 ? (
                          <strong key={i} className="font-medium text-foreground">
                            {part}
                          </strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  </div>
                </div>
              )}

              {diff && (
                <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border bg-surface-overlay px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <AuditDiffCard diff={diff} compact />
                  {diff.hasPrevious && (
                    <Link
                      to="/simba/timeline"
                      className="shrink-0 text-sm font-medium text-simba hover:underline"
                    >
                      Full history →
                    </Link>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {openIssues.length > 0 && (
            <Card>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">Top priorities</h3>
                  <Link
                    to="/simba/issues"
                    className="text-sm text-muted hover:text-foreground"
                  >
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-border rounded-[var(--radius-card)] border border-border">
                  {openIssues.slice(0, 3).map((issue, i) => (
                    <TopIssueRow
                      key={issue.id}
                      issue={issue}
                      rank={i + 1}
                      products={catalog}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          <Card>
            <button
              type="button"
              onClick={() => setShowBreakdown((v) => !v)}
              className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left"
            >
              <span className="text-sm font-medium">Score breakdown</span>
              <Icon
                icon={ChevronDown}
                size={16}
                className={`text-muted transition-transform ${
                  showBreakdown ? "rotate-180" : ""
                }`}
              />
            </button>
            {showBreakdown && (
              <CardBody className="space-y-4 border-t border-border pt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  {scoreCategories.map(({ key, label, icon }) => (
                    <ScoreBar
                      key={key}
                      label={label}
                      score={scores[key]}
                      icon={icon}
                    />
                  ))}
                </div>
              </CardBody>
            )}
          </Card>
        </>
      ) : null}
      </div>
    </div>
  );
}

function TopIssueRow({
  issue,
  rank,
  products,
}: {
  issue: Issue;
  rank: number;
  products: Product[];
}) {
  const action = getIssueAction(issue, products, "/simba/issues");
  const severityLabels: Record<Issue["severity"], string> = {
    critical: "Urgent",
    high: "Important",
    medium: "Moderate",
    low: "Minor",
  };

  return (
    <Link
      to={action?.href ?? "/simba/issues"}
      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-overlay"
    >
      <span className="mt-0.5 text-xs font-medium tabular-nums text-muted">
        {rank}
      </span>
      <Badge label={severityLabels[issue.severity]} severity={issue.severity} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{issue.title}</p>
        {action && (
          <p className="mt-0.5 truncate text-xs text-simba">{action.label}</p>
        )}
      </div>
      {issue.canAutofix && (
        <span className="shrink-0 text-[11px] font-medium text-simba">
          Quick fix
        </span>
      )}
    </Link>
  );
}
