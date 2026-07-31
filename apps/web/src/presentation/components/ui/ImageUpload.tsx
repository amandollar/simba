import { useRef, useState } from "react";
import { uploadsApi } from "@/infrastructure/api/uploads";
import { Camera, Icon } from "./Icon";
import { Button } from "./Button";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  purpose?: "products" | "branding";
  label?: string;
  hint?: string;
  aspect?: "square" | "wide";
}

export function ImageUpload({
  value,
  onChange,
  onClear,
  disabled,
  purpose = "products",
  label = "Click to upload image",
  hint = "PNG, JPG, WebP · max 5 MB",
  aspect = "square",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const url = await uploadsApi.upload(file, purpose);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative inline-block w-full max-w-sm">
          <img
            src={value}
            alt="Upload preview"
            className={`w-full rounded-xl border border-border object-cover ${
              aspect === "wide" ? "aspect-[3/1]" : "aspect-square max-h-40 max-w-40"
            }`}
          />
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="!text-danger"
              disabled={disabled || uploading}
              onClick={() => {
                onClear?.();
                onChange("");
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className={`flex w-full max-w-sm flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-border bg-surface-overlay text-sm text-muted transition-colors hover:border-border-strong hover:bg-surface disabled:opacity-50 ${aspect === "wide" ? "aspect-[3/1]" : "h-40"}`}
        >
          {uploading ? (
            <>
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-simba" />
              Uploading…
            </>
          ) : (
            <>
              <Icon icon={Camera} size={24} className="text-muted" />
              <span>{label}</span>
              <span className="text-xs">{hint}</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
