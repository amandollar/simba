import { type ReactNode } from "react";

export function DataTable({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-x-auto rounded-[var(--radius-card)] border border-border bg-surface-raised shadow-sm scrollbar-thin ${className}`}
    >
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-border bg-surface-overlay/50 text-[11px] font-medium uppercase tracking-wider text-muted">
      {children}
    </thead>
  );
}

export function DataTableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-surface-overlay/60">
      {children}
    </tr>
  );
}

export function DataTableCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

export function DataTableHeaderCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th className={`px-4 py-3 font-medium whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}
