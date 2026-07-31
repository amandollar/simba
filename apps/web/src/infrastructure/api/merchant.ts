import type { LaunchReadiness } from "@/domain/launch-readiness";
import type { Merchant } from "@/domain/types";
import type { StoreBranding } from "@/domain/branding";
import { apiClient } from "./client";

export const merchantApi = {
  me: () => apiClient.get<Merchant | null>("/merchant/me"),

  create: (data: { name: string; slug: string; description?: string }) =>
    apiClient.post<Merchant>("/merchant", data),

  update: (data: {
    name?: string;
    slug?: string;
    description?: string;
    branding?: Partial<StoreBranding>;
  }) => apiClient.patch<Merchant>("/merchant", data),

  launch: () => apiClient.post<Merchant>("/merchant/launch"),

  launchReadiness: () =>
    apiClient.get<LaunchReadiness>("/merchant/launch-readiness"),
};
