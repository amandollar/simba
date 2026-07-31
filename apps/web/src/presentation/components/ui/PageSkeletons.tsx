import type { CSSProperties, ReactNode } from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cx("skeleton-shimmer rounded-[var(--radius-control)]", className)}
      style={style}
      aria-hidden
    />
  );
}

export function PageHeaderSkeleton({
  withAction = true,
}: {
  withAction?: boolean;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </div>
      {withAction && <Skeleton className="h-9 w-28 shrink-0" />}
    </div>
  );
}

export function TablePageSkeleton({
  rows = 5,
  columns = 4,
  withThumb = false,
}: {
  rows?: number;
  columns?: number;
  withThumb?: boolean;
}) {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="hidden overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-raised md:block">
        <div className="border-b border-border bg-surface-overlay/50 px-4 py-3">
          <div className="flex gap-6">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-20" />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0"
          >
            {withThumb && <Skeleton className="h-10 w-10 shrink-0 rounded-md" />}
            <div className="flex flex-1 items-center gap-6">
              {Array.from({ length: columns }).map((_, col) => (
                <Skeleton
                  key={col}
                  className={cx(
                    "h-4",
                    col === 0 ? "w-40" : col === columns - 1 ? "w-16" : "w-24"
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-3 md:hidden">
        {Array.from({ length: Math.min(rows, 4) }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-4"
          >
            <div className="flex gap-3">
              {withThumb && <Skeleton className="h-14 w-14 shrink-0 rounded-md" />}
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5"
        >
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-3 h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton withAction={false} />
      <StatsGridSkeleton />
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5"
          >
            <Skeleton className="h-4 w-28" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-14" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditOverviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Skeleton className="h-[100px] w-[100px] shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-56" />
            <div className="flex flex-wrap gap-2 pt-1">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
        <Skeleton className="mt-5 h-16 w-full rounded-[var(--radius-card)]" />
      </div>
      <div className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5">
        <Skeleton className="h-4 w-28" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-4 w-4 shrink-0" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function IssuesPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-[var(--radius-control)] border border-border bg-surface-overlay p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-[calc(var(--radius-control)-2px)]" />
        ))}
      </div>
      <div className="rounded-[var(--radius-card)] border border-border bg-surface-raised">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 border-b border-border px-4 py-4 last:border-0"
          >
            <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <Skeleton className="h-8 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimelinePageSkeleton() {
  return (
    <div className="space-y-4">
      <PageHeaderSkeleton withAction={false} />
      <div className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5">
        <Skeleton className="h-4 w-32" />
        <div className="mt-6 flex h-32 items-end gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-md"
              style={{ height: `${35 + ((i * 17) % 55)}%` } as CSSProperties}
            />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-4"
          >
            <Skeleton className="h-4 w-48" />
            <Skeleton className="mt-2 h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormPageSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-32" />
      <PageHeaderSkeleton withAction={false} />
      <div className="max-w-xl rounded-[var(--radius-card)] border border-border bg-surface-raised p-5">
        <div className="space-y-5">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className={i === 3 ? "h-24 w-full" : "h-9 w-full"} />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GrowthPageSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-4/5 max-w-lg" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="rounded-[var(--radius-card)] border border-simba/20 bg-simba-soft/20 p-5">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="mt-4 h-5 w-2/3" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-[var(--radius-card)]" />
          ))}
        </div>
      </div>
      <div className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5">
        <Skeleton className="h-4 w-40" />
        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      <Skeleton className="h-14 w-full rounded-[var(--radius-card)]" />
      <Skeleton className="h-12 w-full rounded-[var(--radius-control)]" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5"
        >
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-5 w-1/2" />
          <Skeleton className="mt-2 h-4 w-full" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConsultantPageSkeleton() {
  return (
    <div className="flex h-[min(70vh,640px)] flex-col rounded-[var(--radius-card)] border border-border bg-surface-raised">
      <div className="border-b border-border px-5 py-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-56" />
      </div>
      <div className="flex-1 space-y-4 p-5">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-48 rounded-2xl rounded-br-sm" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
          <Skeleton className="h-20 flex-1 rounded-2xl rounded-tl-sm" />
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-32 rounded-full" />
          ))}
        </div>
      </div>
      <div className="border-t border-border p-4">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({
  count = 3,
  children,
}: {
  count?: number;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      {children ?? <PageHeaderSkeleton withAction={false} />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-28" />
      <PageHeaderSkeleton withAction={false} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5">
          <Skeleton className="h-4 w-24" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5">
          <Skeleton className="h-4 w-20" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Skeleton className="h-4 w-28" />
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-[var(--radius-card)]" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-[75%]" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-36" />
        </div>
      </div>
    </div>
  );
}

export function StorefrontSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-9 w-24" />
      </div>
      <Skeleton className="h-48 w-full rounded-[var(--radius-card)]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-[var(--radius-card)]" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
