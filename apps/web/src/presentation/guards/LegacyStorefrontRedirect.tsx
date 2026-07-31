import { Navigate, useParams } from "react-router-dom";
import { storefrontPath } from "@/domain/storefront-url";

export function LegacyStorefrontRedirect() {
  const { slug, "*": rest } = useParams<{ slug: string; "*": string }>();
  if (!slug) return <Navigate to="/" replace />;
  const suffix = rest ? `/${rest}` : "";
  return <Navigate to={`${storefrontPath(slug)}${suffix}`} replace />;
}
