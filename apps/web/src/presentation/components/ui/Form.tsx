import { type InputHTMLAttributes, forwardRef } from "react";

export const inputClassName =
  "h-9 w-full rounded-[var(--radius-control)] border border-border bg-surface-raised px-3 text-sm transition-colors placeholder:text-muted/60 focus:border-border-strong focus:ring-2 focus:ring-foreground/5";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`${inputClassName} ${className}`}
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`${inputClassName} min-h-[88px] resize-none py-2 ${className}`}
      {...props}
    />
  );
});

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
