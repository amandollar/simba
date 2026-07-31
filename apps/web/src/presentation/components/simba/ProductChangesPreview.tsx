import type { ProductFieldChanges } from "@/domain/types";

export function ProductChangesPreview({
  changes,
}: {
  changes: ProductFieldChanges;
}) {
  const fields = [
    changes.title && { label: "Title", value: changes.title },
    changes.description && { label: "Description", value: changes.description },
    changes.altText && { label: "Alt text", value: changes.altText },
    changes.category && { label: "Category", value: changes.category },
  ].filter(Boolean) as { label: string; value: string }[];

  if (!fields.length) return null;

  return (
    <div className="space-y-2">
      {fields.map((field) => (
        <div
          key={field.label}
          className="rounded-[var(--radius-control)] border border-border bg-surface-overlay px-3 py-2"
        >
          <p className="text-[11px] font-medium text-muted">{field.label}</p>
          <p className="mt-0.5 text-sm leading-snug">{field.value}</p>
        </div>
      ))}
    </div>
  );
}
