import type { FixResult } from "@/domain/types";
import { Button } from "@/presentation/components/ui/Button";
import { Modal } from "@/presentation/components/ui/Modal";
import { Banner } from "@/presentation/components/ui/States";

export interface FixPreviewState {
  issueId: string;
  productId?: string;
  productTitle?: string;
  result: FixResult;
}

function FixChangesPreview({
  changes,
}: {
  changes: NonNullable<FixResult["changes"]>;
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

export function FixPreviewModal({
  preview,
  onClose,
  onApply,
  applying,
  applyError,
  disableClose,
}: {
  preview: FixPreviewState | null;
  onClose: () => void;
  onApply: () => void;
  applying: boolean;
  applyError: string | null;
  disableClose?: boolean;
}) {
  return (
    <Modal
      open={Boolean(preview)}
      onClose={onClose}
      disableClose={disableClose || applying}
      title={
        preview?.productTitle
          ? `Fix for ${preview.productTitle}`
          : "Suggested fix"
      }
      description={
        preview?.result.canApply
          ? "Review the change before applying."
          : "Manual steps for this issue."
      }
    >
      {preview && (
        <div className="max-h-[min(60vh,28rem)] space-y-4 overflow-y-auto pr-1 scrollbar-thin">
          <p className="text-sm leading-relaxed text-muted">
            {preview.result.recommendation}
          </p>
          {preview.result.meta?.validatorNote && preview.result.canApply && (
            <p className="text-xs text-muted">{preview.result.meta.validatorNote}</p>
          )}
          {applyError && <Banner variant="error">{applyError}</Banner>}
          {preview.result.canApply && preview.result.changes && (
            <FixChangesPreview changes={preview.result.changes} />
          )}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {preview.result.canApply ? (
              <>
                <Button variant="primary" onClick={onApply} disabled={applying}>
                  {applying ? "Applying…" : "Apply changes"}
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
