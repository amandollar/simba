import type { ReactNode } from "react";

export function SimbaSectionHeader({
  title,
  description,
  action,
  badge,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      {(action || badge) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {badge}
          {action}
        </div>
      )}
    </div>
  );
}
