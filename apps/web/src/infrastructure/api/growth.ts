import type { GrowthPlanSummary, StoredGrowthPlan } from "@/domain/types";
import { apiClient } from "./client";

export const growthApi = {
  getLatestPlan: () => apiClient.get<StoredGrowthPlan | null>("/growth/plan"),

  listPlans: () => apiClient.get<GrowthPlanSummary[]>("/growth/plans"),

  getPlan: (id: string) => apiClient.get<StoredGrowthPlan>(`/growth/plans/${id}`),

  generatePlan: () => apiClient.post<StoredGrowthPlan>("/growth/plan"),

  toggleActionComplete: (planId: string, actionId: string) =>
    apiClient.patch<StoredGrowthPlan>(
      `/growth/plans/${planId}/actions/${actionId}`,
      {}
    ),
};
