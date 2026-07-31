import type { AuditDiff } from "@/domain/types";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import { Icon, CheckCircle2, Plus, RefreshCw } from "@/presentation/components/ui/Icon";
import { FixProofList } from "./FixProofList";

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function scoreChangeText(delta: number) {
  if (delta === 0) return "Score unchanged";
  if (delta > 0) return `Up ${delta} points`;
  return `Down ${Math.abs(delta)} points`;
}

function buildSummaryLine(diff: AuditDiff) {
  const { fixedCount, newCount, recurringCount } = diff.summary;
  const parts: string[] = [];

  if (diff.overallDelta > 0) {
    parts.push("Your store health improved");
  } else if (diff.overallDelta < 0) {
    parts.push("Your score dipped a little");
  }

  if (fixedCount > 0) {
    parts.push(
      `${fixedCount} ${fixedCount === 1 ? "issue cleared" : "issues cleared"}`
    );
  }
  if (newCount > 0) {
    parts.push(
      `${newCount} new ${newCount === 1 ? "finding" : "findings"}`
    );
  }
  if (recurringCount > 0) {
    parts.push(
      `${recurringCount} still ${recurringCount === 1 ? "needs work" : "need work"}`
    );
  }

  return parts.length > 0 ? parts.join(" · ") : "No major changes since your last scan";
}

function IssueList({
  title,
  hint,
  icon,
  issues,
  tone,
}: {
  title: string;
  hint?: string;
  icon: typeof CheckCircle2;
  issues: AuditDiff["fixedIssues"];
  tone: "success" | "warning" | "muted";
}) {
  if (!issues.length) return null;

  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : "text-muted";

  return (
    <div className="space-y-2">
      <div>
        <div className={`flex items-center gap-1.5 text-sm font-medium ${toneClass}`}>
          <Icon icon={icon} size={15} />
          {title}
          <span className="font-normal text-muted">({issues.length})</span>
        </div>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
      <ul className="space-y-2">
        {issues.slice(0, 5).map((issue) => (
          <li
            key={issue.title}
            className="flex items-start gap-2 text-sm leading-snug text-foreground"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border-strong" />
            <span>{issue.title}</span>
          </li>
        ))}
        {issues.length > 5 && (
          <li className="pl-3.5 text-xs text-muted">
            +{issues.length - 5} more
          </li>
        )}
      </ul>
    </div>
  );
}

export function AuditDiffCard({
  diff,
  compact = false,
}: {
  diff: AuditDiff;
  compact?: boolean;
}) {
  if (!diff.hasPrevious) {
    return (
      <Card className="border-border">
        <CardBody className="space-y-1 text-sm">
          <p className="font-medium text-foreground">Your first scan</p>
          <p className="text-muted">
            Simba found {diff.newIssues.length}{" "}
            {diff.newIssues.length === 1 ? "thing" : "things"} to improve. Make
            some fixes, then scan again to see your progress.
          </p>
        </CardBody>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
        <span className={diff.overallDelta >= 0 ? "text-success" : "text-danger"}>
          {scoreChangeText(diff.overallDelta)}
        </span>
        {diff.summary.fixedCount > 0 && (
          <span>{diff.summary.fixedCount} cleared</span>
        )}
        {diff.summary.newCount > 0 && (
          <span>{diff.summary.newCount} new</span>
        )}
      </div>
    );
  }

  const previousScore = diff.previous?.overallScore;

  return (
    <Card className="border-simba/15 bg-gradient-to-br from-simba-soft/30 to-surface-raised">
      <CardBody className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">What changed</p>
            <p className="mt-1 text-sm text-muted">{buildSummaryLine(diff)}</p>
            <p className="mt-2 text-xs text-muted">
              Compared to your scan on {formatDate(diff.previous!.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums">
              {diff.current.overallScore}
              <span className="text-base font-normal text-muted">/100</span>
            </p>
            {previousScore !== undefined && (
              <p className="text-xs text-muted">
                was {previousScore}
              </p>
            )}
            <p
              className={`mt-0.5 text-sm font-medium ${
                diff.overallDelta >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {scoreChangeText(diff.overallDelta)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-card)] border border-border bg-border text-center text-sm">
          <div className="bg-surface-raised px-3 py-2.5">
            <p className="font-semibold text-success tabular-nums">
              {diff.summary.fixedCount}
            </p>
            <p className="text-[11px] text-muted">Cleared</p>
          </div>
          <div className="bg-surface-raised px-3 py-2.5">
            <p className="font-semibold text-warning tabular-nums">
              {diff.summary.newCount}
            </p>
            <p className="text-[11px] text-muted">New findings</p>
          </div>
          <div className="bg-surface-raised px-3 py-2.5">
            <p className="font-semibold tabular-nums">
              {diff.summary.recurringCount}
            </p>
            <p className="text-[11px] text-muted">Still open</p>
          </div>
        </div>

        <IssueList
          title="No longer flagged"
          hint="These showed up last time but not in this scan."
          icon={CheckCircle2}
          issues={diff.fixedIssues}
          tone="success"
        />
        <IssueList
          title="New to look at"
          hint="Simba noticed these for the first time."
          icon={Plus}
          issues={diff.newIssues}
          tone="warning"
        />
        <IssueList
          title="Still needs attention"
          hint="These came up again — worth prioritizing."
          icon={RefreshCw}
          issues={diff.recurringIssues}
          tone="muted"
        />

        {diff.fixesApplied.length > 0 && (
          <FixProofList proofs={diff.fixesApplied} title="Changes you applied" />
        )}
      </CardBody>
    </Card>
  );
}
