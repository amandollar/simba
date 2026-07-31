import type { ReactNode } from "react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface-raised px-6 py-8 text-center">
      <p className="text-sm text-danger">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm font-medium text-foreground hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  icon,
  action,
}: {
  title?: string;
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface-raised px-6 py-14 text-center">
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      {title && (
        <p className="text-sm font-medium text-foreground">{title}</p>
      )}
      <p className={`text-sm leading-relaxed text-muted ${title ? "mt-1" : ""}`}>
        {message}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const bannerStyles = {
  success: "border-success/25 bg-success/5 text-foreground",
  error: "border-danger/25 bg-danger/5 text-danger",
  info: "border-border bg-surface-overlay text-foreground",
} as const;

export function Banner({
  variant = "info",
  children,
  onDismiss,
}: {
  variant?: keyof typeof bannerStyles;
  children: ReactNode;
  onDismiss?: () => void;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-[var(--radius-control)] border px-4 py-3 text-sm ${bannerStyles[variant]}`}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-muted hover:text-foreground"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
