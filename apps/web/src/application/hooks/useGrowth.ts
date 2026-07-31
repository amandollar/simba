import { growthApi } from "@/infrastructure/api";
import { useAsyncData, useMutation } from "./useAsync";

export function useLatestGrowthPlan() {
  return useAsyncData(() => growthApi.getLatestPlan(), []);
}

export function useGrowthPlanHistory() {
  return useAsyncData(() => growthApi.listPlans(), []);
}

export function useGrowthPlan() {
  return useMutation(() => growthApi.generatePlan());
}

export function useGrowthActionToggle(onSuccess?: (plan: Awaited<ReturnType<typeof growthApi.toggleActionComplete>>) => void) {
  return useMutation((planId: string, actionId: string) =>
    growthApi.toggleActionComplete(planId, actionId).then((plan) => {
      onSuccess?.(plan);
      return plan;
    })
  );
}
