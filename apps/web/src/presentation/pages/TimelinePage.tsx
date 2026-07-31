import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuditHistory, useFixHistory } from "@/application/hooks";
import { auditsApi } from "@/infrastructure/api";
import type { AuditDiff } from "@/domain/types";
import { getScoreTier } from "@/domain/scores";
import { AuditDiffCard } from "@/presentation/components/simba/AuditDiffCard";
import { SimbaSectionHeader } from "@/presentation/components/simba/SimbaSectionHeader";
import { FixProofList } from "@/presentation/components/simba/FixProofList";
import { ScoreRing } from "@/presentation/components/dashboard/ScoreCard";
import { Button } from "@/presentation/components/ui/Button";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import { IconBox, LineChart } from "@/presentation/components/ui/Icon";
import {
  EmptyState,
  ErrorState,
  Banner,
} from "@/presentation/components/ui/States";
import { TimelinePageSkeleton } from "@/presentation/components/ui/PageSkeletons";

function formatAuditChartLabel(createdAt: string) {
  const date = new Date(createdAt);
  return {
    date: date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function TimelinePage() {
  const { data: audits, loading, error, reload } = useAuditHistory();
  const { data: fixes } = useFixHistory(10);
  const [expandedDiff, setExpandedDiff] = useState<AuditDiff | null>(null);
  const [loadingDiffId, setLoadingDiffId] = useState<string | null>(null);
  const [diffError, setDiffError] = useState<string | null>(null);

  const chartData = useMemo(() => {
    if (!audits?.length) return [];
    return [...audits].reverse();
  }, [audits]);

  async function handleExpandDiff(auditId: string) {
    if (expandedDiff?.current.id === auditId) {
      setExpandedDiff(null);
      return;
    }

    setLoadingDiffId(auditId);
    setDiffError(null);
    try {
      const diff = await auditsApi.getDiffForAudit(auditId);
      setExpandedDiff(diff);
    } catch (err) {
      setExpandedDiff(null);
      setDiffError(
        err instanceof Error ? err.message : "Couldn't load scan comparison."
      );
    } finally {
      setLoadingDiffId(null);
    }
  }

  if (loading) return <TimelinePageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <SimbaSectionHeader
        title="History"
        description="Score history, applied fixes, and what changed between scans"
      />

      {diffError && (
        <Banner variant="error" onDismiss={() => setDiffError(null)}>
          {diffError}
        </Banner>
      )}

      {!audits?.length ? (
        <EmptyState
          icon={<IconBox icon={LineChart} />}
          title="No scans yet"
          message="Run your first scan from Audit center to start tracking progress."
          action={
            <Link to="/simba">
              <Button variant="simba">Run first scan</Button>
            </Link>
          }
        />
      ) : (
        <>
          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-end justify-between gap-2">
                <p className="text-sm font-medium">Score history</p>
                <p className="text-xs text-muted">
                  {chartData.length} scan{chartData.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="overflow-x-auto pb-1">
                <div
                  className="flex items-end justify-start gap-3 px-1 sm:gap-4"
                  style={{
                    minWidth:
                      chartData.length > 8
                        ? `${chartData.length * 3.5}rem`
                        : undefined,
                  }}
                >
                {chartData.map((audit) => {
                  const { tone } = getScoreTier(audit.overallScore);
                  const barHeight = Math.max(16, (audit.overallScore / 100) * 112);
                  const barColor =
                    tone === "excellent" || tone === "good"
                      ? "bg-success"
                      : tone === "warning"
                        ? "bg-warning"
                        : "bg-danger";
                  const label = formatAuditChartLabel(audit.createdAt);

                  return (
                    <div
                      key={audit.id}
                      className="flex w-14 shrink-0 flex-col items-center gap-2 sm:w-16"
                      title={`${audit.overallScore}/100 · ${new Date(audit.createdAt).toLocaleString()}`}
                    >
                      <span className="text-xs font-medium tabular-nums text-foreground">
                        {audit.overallScore}
                      </span>
                      <div className="flex h-28 w-full items-end justify-center">
                        <div
                          className={`w-10 rounded-t-md sm:w-12 ${barColor}`}
                          style={{ height: barHeight }}
                        />
                      </div>
                      <span className="w-full text-center text-[10px] leading-tight text-muted">
                        <span className="block">{label.date}</span>
                        <span className="mt-0.5 block tabular-nums">{label.time}</span>
                      </span>
                    </div>
                  );
                })}
                </div>
              </div>
            </CardBody>
          </Card>

          {fixes && fixes.length > 0 && (
            <Card>
              <CardBody>
                <FixProofList proofs={fixes} title="Changes you applied" />
              </CardBody>
            </Card>
          )}

          <div className="space-y-3">
            {audits.map((audit) => {
              const summary = audit.diffSummary;
              const tier = getScoreTier(audit.overallScore);
              const isExpanded = expandedDiff?.current.id === audit.id;

              return (
                <Card key={audit.id}>
                  <CardBody className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <ScoreRing score={audit.overallScore} size={56} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {audit.overallScore}/100
                          <span className="ml-2 text-sm font-normal text-muted">
                            {tier.label}
                          </span>
                          {summary && (
                            <span
                              className={`ml-2 text-sm font-normal ${
                                summary.overallDelta >= 0
                                  ? "text-success"
                                  : "text-danger"
                              }`}
                            >
                              {summary.overallDelta >= 0 ? "Up" : "Down"}{" "}
                              {Math.abs(summary.overallDelta)} points
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted">
                          {new Date(audit.createdAt).toLocaleString()}
                        </p>
                        {summary && (
                          <p className="mt-1 text-xs text-muted">
                            {summary.fixedCount} cleared · {summary.newCount}{" "}
                            new · {summary.recurringCount} still open
                            {summary.fixesAppliedCount > 0 &&
                              ` · ${summary.fixesAppliedCount} change${summary.fixesAppliedCount !== 1 ? "s" : ""} applied`}
                          </p>
                        )}
                      </div>
                      {summary && (
                        <Button
                          variant="ghost"
                          onClick={() => handleExpandDiff(audit.id)}
                          disabled={loadingDiffId === audit.id}
                        >
                          {loadingDiffId === audit.id
                            ? "Loading…"
                            : isExpanded
                              ? "Hide details"
                              : "See what changed"}
                        </Button>
                      )}
                    </div>

                    {isExpanded && expandedDiff && (
                      <AuditDiffCard diff={expandedDiff} />
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
