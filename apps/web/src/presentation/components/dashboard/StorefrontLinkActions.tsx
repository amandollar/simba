import { useState } from "react";
import { storefrontPath, storefrontUrl } from "@/domain/storefront-url";
import { Button } from "@/presentation/components/ui/Button";

export function StorefrontLinkActions({
  slug,
  layout = "row",
}: {
  slug: string;
  layout?: "row" | "stack";
}) {
  const [copied, setCopied] = useState(false);
  const url = storefrontUrl(slug);
  const href = storefrontPath(slug);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={
        layout === "stack"
          ? "flex flex-col gap-2"
          : "flex flex-wrap justify-center gap-2"
      }
    >
      <Button type="button" variant="secondary" onClick={copyLink}>
        {copied ? "Copied!" : "Copy store link"}
      </Button>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Button type="button" variant="ghost" className="w-full sm:w-auto">
          Open storefront ↗
        </Button>
      </a>
    </div>
  );
}
