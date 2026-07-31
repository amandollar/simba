import type { FixProof } from "@/domain/types";
import { Icon, Wand2 } from "@/presentation/components/ui/Icon";

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  altText: "Alt text",
  category: "Category",
};

function ChangeRow({
  field,
  before,
  after,
}: {
  field: string;
  before: string | null;
  after: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-3 text-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {FIELD_LABELS[field] ?? field}
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-[11px] text-muted">Before</p>
          <p className="mt-0.5 leading-relaxed text-danger/90 line-through decoration-danger/40">
            {before?.trim() ? before : "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted">After</p>
          <p className="mt-0.5 leading-relaxed text-success">{after}</p>
        </div>
      </div>
    </div>
  );
}

export function FixProofCard({ proof }: { proof: FixProof }) {
  const fields = Object.entries(proof.changes);

  return (
    <div className="space-y-3 rounded-[var(--radius-card)] border border-border bg-surface-overlay p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <Icon icon={Wand2} size={14} className="text-simba" />
            <p className="text-sm font-medium">{proof.issueTitle}</p>
          </div>
          {proof.productTitle && (
            <p className="mt-0.5 text-xs text-muted">{proof.productTitle}</p>
          )}
        </div>
        <time className="shrink-0 text-[11px] text-muted">
          {new Date(proof.appliedAt).toLocaleString(undefined, {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </time>
      </div>

      <div className="space-y-2">
        {fields.map(([field, change]) => (
          <ChangeRow
            key={field}
            field={field}
            before={change.before}
            after={change.after}
          />
        ))}
      </div>
    </div>
  );
}

export function FixProofList({
  proofs,
  title = "Applied fixes",
}: {
  proofs: FixProof[];
  title?: string;
}) {
  if (!proofs.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {title}
      </p>
      {proofs.map((proof) => (
        <FixProofCard key={proof.id} proof={proof} />
      ))}
    </div>
  );
}
