import { useOutletContext } from "react-router-dom";
import type { PublicStore } from "@/domain/types";
import { cloudinaryImageUrl } from "@/domain/cloudinary";
import { Icon, Package, Star } from "@/presentation/components/ui/Icon";

export function useStorefront() {
  return useOutletContext<{ store: PublicStore }>();
}

export { formatMoney as formatPrice } from "@/domain/helpers";

export function ProductImage({
  src,
  alt,
  className = "",
  width,
  height,
}: {
  src?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  const optimized = src
    ? cloudinaryImageUrl(src, { width, height })
    : undefined;

  if (optimized) {
    return (
      <img
        src={optimized}
        alt={alt ?? ""}
        className={`bg-surface-overlay object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-surface-overlay text-muted ${className}`}
    >
      <Icon icon={Package} size={32} className="opacity-40" />
    </div>
  );
}

export function StarRating({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
}) {
  const iconSize = size === "sm" ? 14 : 18;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={onChange ? `Rate ${star} stars` : undefined}
        >
          <Icon
            icon={Star}
            size={iconSize}
            className={
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "text-border"
            }
          />
        </button>
      ))}
    </div>
  );
}
