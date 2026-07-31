import { type ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-[var(--store-accent)] text-white hover:bg-[var(--store-accent-hover)] disabled:opacity-50",
  secondary:
    "bg-surface-raised text-foreground border border-border hover:bg-surface-overlay disabled:opacity-50",
} as const;

interface StorefrontButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
}

export function StorefrontButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: StorefrontButtonProps) {
  return (
    <button
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 text-sm font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
