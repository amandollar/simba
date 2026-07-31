import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useIssueActions, useIssues, useLatestAudit, useProducts, markAuditRescanWatch } from "@/application/hooks";
import { getIssueAction } from "@/domain/issue-actions";
import {
  formatIssueDescription,
  getAffectedProducts,
} from "@/domain/issue-affected";
import { sortIssuesByPriority } from "@/domain/issues";
import type {
  FixProof,
  Issue,
  IssueCategory,
  IssueEffort,
  IssueSeverity,
  IssueStatus,
  Product,
} from "@/domain/types";
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
  Target,
  Wand2,
} from "@/presentation/components/ui/Icon";
import {
  EmptyState,
  ErrorState,
  Banner,
} from "@/presentation/components/ui/States";
import { IssuesPageSkeleton } from "@/presentation/components/ui/PageSkeletons";
import {
  FixPreviewModal,
  type FixPreviewState,
} from "@/presentation/components/simba/FixPreviewModal";
import { SimbaSectionHeader } from "@/presentation/components/simba/SimbaSectionHeader";
import { IssueActionButton } from "@/presentation/components/simba/IssueActionButton";

const filters: { label: string; value?: IssueStatus }[] = [
  { label: "To fix", value: "open" },
  { label: "Done", value: "resolved" },
  { label: "Ignored", value: "dismissed" },
  { label: "All" },
];

const ISSUES_PAGE_SIZE = 5;

const categoryMeta: Record<
  IssueCategory,
  { label: string; icon: LucideIcon }
> = {
  ux: { label: "Experience", icon: Sparkles },
  seo: { label: "Search", icon: Search },
  accessibility: { label: "Accessibility", icon: Accessibility },
  conversion: { label: "Sales", icon: ShoppingCart },
  trust: { label: "Trust", icon: Shield },
};

const severityLabel: Record<IssueSeverity, string> = {
  critical: "Urgent",
  high: "Important",
  medium: "Moderate",
  low: "Minor",
};

function effortHint(effort: IssueEffort, canAutofix: boolean) {
  if (canAutofix && effort === "low") return "Quick win";
  if (effort === "low") return "Easy";
  if (effort === "medium") return "Some work";
  return "Takes time";
}

function AffectedProductsList({
  products,
  canAutofix,
  onFixProduct,
  fixingProductId,
}: {
  products: Product[];
  canAutofix: boolean;
  onFixProduct?: (productId: string, productTitle: string) => void;
  fixingProductId?: string | null;
}) {
  const multi = products.length > 1;

  return (
    <div className="rounded-[var(--radius-control)] border border-border bg-surface-raised p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-medium text-muted">
          Affected products ({products.length})
        </p>
        {multi && canAutofix && (
          <p className="text-xs text-muted">Auto-fix one product at a time</p>
        )}
      </div>
      <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm scrollbar-thin">
        {products.map((product) => (
          <li
            key={product.id}
            className="flex items-center justify-between gap-3"
          >
            <Link
              to={`/products/${product.id}/edit?from=${encodeURIComponent("/simba/issues")}`}
              className="min-w-0 truncate text-simba hover:underline"
            >
              {product.title}
            </Link>
            {canAutofix && onFixProduct && (
              <Button
                type="button"
                variant="secondary"
                className="h-7 shrink-0 px-2 text-xs"
                onClick={() => onFixProduct(product.id, product.title)}
                disabled={Boolean(fixingProductId)}
              >
                <Icon icon={Wand2} size={12} />
                {fixingProductId === product.id ? "Preparing…" : "Auto-fix"}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function IssueRow({
  issue,
  products,
  rank,
  expanded,
  onToggle,
  onDismiss,
  onResolve,
  onFix,
  fixingProductId,
  activeFix,
}: {
  issue: Issue;
  products: Product[];
  rank?: number;
  expanded: boolean;
  onToggle: () => void;
  onDismiss: (id: string) => void;
  onResolve: (id: string) => void;
  onFix: (issueId: string, productId?: string, productTitle?: string) => void;
  fixingProductId?: string | null;
  activeFix?: boolean;
}) {
  const category = categoryMeta[issue.category];
  const action = issue.status === "open" ? getIssueAction(issue, products, "/simba/issues") : null;
  const affected = getAffectedProducts(issue, products);
  const description = formatIssueDescription(issue, affected.length);
  const showGlobalFix =
    issue.canAutofix && issue.status === "open" && affected.length <= 1;

  return (
    <div
      className={`border-b border-border last:border-b-0 ${
        activeFix ? "bg-simba-soft/20" : ""
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-overlay"
      >
        {rank !== undefined && (
          <span className="mt-0.5 w-5 shrink-0 text-xs font-medium tabular-nums text-muted">
            {rank}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge label={severityLabel[issue.severity]} severity={issue.severity} />
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <Icon icon={category.icon} size={12} />
              {category.label}
            </span>
            {issue.canAutofix && issue.status === "open" && (
              <span className="text-[11px] font-medium text-simba">Quick fix</span>
            )}
          </div>
          <p className="mt-1.5 text-sm font-medium leading-snug">{issue.title}</p>
          {!expanded && issue.fixSummary && issue.status === "open" && (
            <p className="mt-1 line-clamp-1 text-xs text-muted">{issue.fixSummary}</p>
          )}
        </div>
        <Icon
          icon={ChevronDown}
          size={16}
          className={`mt-1 shrink-0 text-muted transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-border bg-surface-overlay/50 px-4 py-4">
          <p className="text-sm leading-relaxed text-muted">{description}</p>

          {affected.length > 0 && (
            <AffectedProductsList
              products={affected}
              canAutofix={issue.canAutofix && issue.status === "open"}
              onFixProduct={
                issue.canAutofix && issue.status === "open"
                  ? (productId, productTitle) =>
                      onFix(issue.id, productId, productTitle)
                  : undefined
              }
              fixingProductId={fixingProductId}
            />
          )}

          <div className="flex flex-wrap gap-2 text-xs text-muted">
            <span>{effortHint(issue.effort, issue.canAutofix)}</span>
            {issue.status !== "open" && (
              <Badge
                label={issue.status === "resolved" ? "Done" : "Ignored"}
                variant={issue.status === "resolved" ? "success" : "neutral"}
              />
            )}
          </div>

          {issue.fixSummary && issue.status === "open" && (
            <p className="rounded-[var(--radius-control)] border border-border bg-surface-raised px-3 py-2 text-sm text-muted">
              <span className="font-medium text-foreground">Suggested: </span>
              {issue.fixSummary}
            </p>
          )}

          {issue.status === "open" && (
            <div className="flex flex-wrap gap-2 pt-1">
              {showGlobalFix && (
                <Button
                  variant="primary"
                  className="h-8 px-3 text-xs"
                  onClick={() =>
                    onFix(
                      issue.id,
                      affected[0]?.id,
                      affected[0]?.title
                    )
                  }
                  disabled={Boolean(fixingProductId)}
                >
                  <Icon icon={Wand2} size={14} />
                  {fixingProductId ? "Preparing…" : "Get fix"}
                </Button>
              )}
              {action && affected.length === 0 && (
                <IssueActionButton action={action} />
              )}
              <Button
                variant="secondary"
                className="h-8 px-3 text-xs"
                onClick={() => onResolve(issue.id)}
              >
                Mark done
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-3 text-xs"
                onClick={() => onDismiss(issue.id)}
              >
                Ignore
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IssuePagination({
  page,
  pageCount,
  total,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  const start = (page - 1) * ISSUES_PAGE_SIZE + 1;
  const end = Math.min(page * ISSUES_PAGE_SIZE, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
      <p className="text-xs text-muted">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          className="h-8 px-3 text-xs"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="text-xs tabular-nums text-muted">
          {page} / {pageCount}
        </span>
        <Button
          type="button"
          variant="secondary"
          className="h-8 px-3 text-xs"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export function IssuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<IssueStatus | undefined>("open");
  const { data: allIssues, loading, error, reload } = useIssues();
  const { data: products, reload: reloadProducts } = useProducts();
  const catalog = products ?? [];
  const { updateStatus, applyFix } = useIssueActions(reload);
  const { data: latestAudit } = useLatestAudit();
  const hasScan = Boolean(latestAudit);
  const deepLinkHandled = useRef(false);
  const [fixPreview, setFixPreview] = useState<FixPreviewState | null>(null);
  const [appliedProof, setAppliedProof] = useState<FixProof | null>(null);
  const [appliedRemaining, setAppliedRemaining] = useState<number | null>(null);
  const [rescanScheduled, setRescanScheduled] = useState(false);
  const [fixingTarget, setFixingTarget] = useState<{
    issueId: string;
    productId?: string;
  } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!appliedProof) return;
    const timer = window.setTimeout(() => {
      setAppliedProof(null);
      setAppliedRemaining(null);
      setRescanScheduled(false);
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [appliedProof]);

  const filteredIssues = useMemo(() => {
    if (!allIssues) return [];
    if (!filter) return allIssues;
    return allIssues.filter((issue) => issue.status === filter);
  }, [allIssues, filter]);

  const sorted = useMemo(
    () => sortIssuesByPriority(filteredIssues),
    [filteredIssues]
  );

  const pageCount = Math.max(1, Math.ceil(sorted.length / ISSUES_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * ISSUES_PAGE_SIZE;
    return sorted.slice(start, start + ISSUES_PAGE_SIZE);
  }, [sorted, currentPage]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  function goToPage(nextPage: number) {
    setPage(nextPage);
    setExpandedId(null);
    setFixPreview(null);
  }

  const openSummary = useMemo(() => {
    const open = (allIssues ?? []).filter((i) => i.status === "open");
    return {
      total: open.length,
      urgent: open.filter((i) => i.severity === "critical").length,
      quickFixes: open.filter((i) => i.canAutofix).length,
    };
  }, [allIssues]);

  async function handleFix(
    issueId: string,
    productId?: string,
    productTitle?: string
  ) {
    setAppliedProof(null);
    setAppliedRemaining(null);
    setRescanScheduled(false);
    setExpandedId(issueId);
    setFixingTarget({ issueId, productId });
    const result = await applyFix.mutate(issueId, false, productId);
    setFixingTarget(null);
    if (result) {
      setFixPreview({
        issueId,
        productId,
        productTitle: productTitle ?? result.meta?.productTitle,
        result,
      });
    }
  }

  useEffect(() => {
    const issueId = searchParams.get("issue");
    if (!issueId || deepLinkHandled.current || !allIssues?.length) return;

    const issue = allIssues.find((item) => item.id === issueId);
    if (!issue || issue.status !== "open") {
      deepLinkHandled.current = true;
      setSearchParams({}, { replace: true });
      return;
    }

    const wantsAutofix =
      searchParams.get("autofix") === "1" && issue.canAutofix;
    if (wantsAutofix && products === undefined) return;

    deepLinkHandled.current = true;
    setFilter("open");
    setExpandedId(issueId);

    if (wantsAutofix) {
      const affected = getAffectedProducts(issue, catalog);
      void handleFix(issueId, affected[0]?.id, affected[0]?.title);
    }

    setSearchParams({}, { replace: true });
  }, [allIssues, catalog, products, searchParams, setSearchParams]);

  async function handleApplyFix() {
    if (!fixPreview?.result.changes) return;
    const result = await applyFix.mutate(
      fixPreview.issueId,
      true,
      fixPreview.productId ?? fixPreview.result.changes.productId,
      fixPreview.result.changes
    );
    if (result) {
      setFixPreview(null);
      if (result.proof) setAppliedProof(result.proof);
      setAppliedRemaining(result.meta?.remainingCount ?? null);
      if (result.meta?.rescanScheduled) {
        markAuditRescanWatch();
        setRescanScheduled(true);
      } else {
        setRescanScheduled(false);
      }
      reload();
      reloadProducts();
    }
  }

  if (loading && !allIssues) return <IssuesPageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <SimbaSectionHeader
        title="Fixes"
        description="Prioritized issues from your latest scan — apply quick fixes or mark them done."
      />

      {filter === "open" && openSummary.total > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span>
            <strong className="font-medium text-foreground">
              {openSummary.total}
            </strong>{" "}
            to fix
          </span>
          {openSummary.urgent > 0 && (
            <span>
              <strong className="font-medium text-danger">
                {openSummary.urgent}
              </strong>{" "}
              urgent
            </span>
          )}
          {openSummary.quickFixes > 0 && (
            <span>
              <strong className="font-medium text-simba">
                {openSummary.quickFixes}
              </strong>{" "}
              with quick fixes
            </span>
          )}
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto rounded-[var(--radius-control)] border border-border bg-surface-overlay p-1 scrollbar-thin">
        {filters.map((f) => (
          <button
            key={f.label}
            onClick={() => {
              setFilter(f.value);
              setExpandedId(null);
              setFixPreview(null);
              setPage(1);
            }}
            className={`shrink-0 rounded-[calc(var(--radius-control)-2px)] px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
              filter === f.value
                ? "bg-surface-raised font-medium text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {applyFix.error && !fixPreview && (
        <Banner variant="error">{applyFix.error}</Banner>
      )}

      {updateStatus.error && (
        <Banner variant="error">{updateStatus.error}</Banner>
      )}

      {appliedProof && (
        <Banner
          variant="success"
          onDismiss={() => {
            setAppliedProof(null);
            setAppliedRemaining(null);
            setRescanScheduled(false);
          }}
        >
          <span className="font-medium text-success">Change applied</span>
          {appliedProof.productTitle ? ` for ${appliedProof.productTitle}` : ""}
          .
          {appliedRemaining !== null && appliedRemaining > 0 && (
            <>
              {" "}
              {appliedRemaining} product{appliedRemaining === 1 ? "" : "s"} still
              need this fix.
            </>
          )}
          {rescanScheduled && " Re-scanning your store now."}
        </Banner>
      )}

      <FixPreviewModal
        preview={fixPreview}
        onClose={() => setFixPreview(null)}
        onApply={handleApplyFix}
        applying={applyFix.loading}
        applyError={fixPreview ? applyFix.error : null}
        disableClose={applyFix.loading}
      />

      {!sorted.length ? (
        <EmptyState
          icon={<IconBox icon={Target} />}
          title={
            filter === "open" && !hasScan
              ? "No scan yet"
              : filter === "open"
                ? "Nothing to fix"
                : filter === "resolved"
                  ? "No completed fixes yet"
                  : filter === "dismissed"
                    ? "No ignored items"
                    : "No issues"
          }
          message={
            filter === "open" && !hasScan
              ? "Run your first scan from Audit center to see what needs fixing."
              : filter === "open"
                ? "Great work — run another scan to check for new findings."
                : "Nothing in this list yet."
          }
          action={
            filter === "open" ? (
              <Link to="/simba">
                <Button variant={hasScan ? "secondary" : "simba"}>
                  {hasScan ? "Back to audit center" : "Run first scan"}
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            {paginatedIssues.map((issue, i) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                products={catalog}
                rank={
                  filter === "open" || filter === undefined
                    ? (currentPage - 1) * ISSUES_PAGE_SIZE + i + 1
                    : undefined
                }
                expanded={expandedId === issue.id}
                onToggle={() =>
                  setExpandedId((id) => (id === issue.id ? null : issue.id))
                }
                fixingProductId={
                  fixingTarget?.issueId === issue.id
                    ? fixingTarget.productId ?? "__issue__"
                    : null
                }
                activeFix={fixPreview?.issueId === issue.id}
                onDismiss={(id) => updateStatus.mutate(id, "dismissed")}
                onResolve={(id) => updateStatus.mutate(id, "resolved")}
                onFix={handleFix}
              />
            ))}
            <IssuePagination
              page={currentPage}
              pageCount={pageCount}
              total={sorted.length}
              onPageChange={goToPage}
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
