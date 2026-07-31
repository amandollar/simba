import type { IssueSeverity, IssueStatus } from "@/domain/types";

const severityStyles: Record<IssueSeverity, string> = {
  critical:
    "border-danger/30 bg-danger/10 text-danger",
  high: "border-warning/30 bg-warning/10 text-warning",
  medium: "bg-surface-overlay text-muted border-border",
  low: "bg-surface-overlay text-muted/80 border-border",
};

const variantStyles = {
  simba: "bg-simba-soft text-simba border-border",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  neutral: "bg-surface-overlay text-muted border-border",
} as const;

function formatLabel(label: string) {
  if (!label) return label;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function Badge({
  label,
  severity,
  variant,
}: {
  label: string;
  severity?: IssueSeverity;
  variant?: keyof typeof variantStyles;
}) {
  let style: string = variantStyles.neutral;

  if (severity) style = severityStyles[severity];
  else if (variant) style = variantStyles[variant];

  return (
    <span
      className={`inline-flex shrink-0 rounded-[var(--radius-control)] border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${style}`}
    >
      {formatLabel(label)}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  let variant: keyof typeof variantStyles = "neutral";

  if (normalized === "paid" || normalized === "completed") {
    variant = "success";
  } else if (normalized === "pending") {
    variant = "warning";
  } else if (normalized === "cancelled" || normalized === "refunded") {
    variant = "neutral";
  }

  return <Badge label={status} variant={variant} />;
}

export type { IssueStatus };
