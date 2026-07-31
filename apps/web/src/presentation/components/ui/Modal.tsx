import { useEffect, type ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  disableClose = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  disableClose?: boolean;
}) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !disableClose) onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, disableClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={disableClose ? undefined : onClose}
        disabled={disableClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-md rounded-[var(--radius-card)] border border-border bg-surface-raised shadow-lg"
      >
        <div className="border-b border-border px-5 py-4">
          <h2 id="modal-title" className="text-base font-semibold tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-muted">{description}</p>
          )}
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
