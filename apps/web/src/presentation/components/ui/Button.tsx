import { type ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-foreground text-surface-raised hover:bg-accent-hover disabled:opacity-50",
  secondary:
    "bg-surface-raised text-foreground border border-border hover:bg-surface-overlay disabled:opacity-50",
  danger:
    "bg-surface-raised text-danger border border-border hover:bg-red-50 disabled:opacity-50",
  ghost:
    "text-muted hover:bg-surface-overlay hover:text-foreground disabled:opacity-50",
  simba:
    "bg-simba text-white hover:bg-simba-hover disabled:opacity-50",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 text-sm font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
