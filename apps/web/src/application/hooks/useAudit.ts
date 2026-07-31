import { auditsApi } from "@/infrastructure/api";
import { useAsyncData, useMutation } from "./useAsync";

export function useLatestAudit() {
  return useAsyncData(() => auditsApi.getLatest(), []);
}

export function useAuditHistory() {
  return useAsyncData(() => auditsApi.getAll(), []);
}

export function useAuditDiff() {
  return useAsyncData(() => auditsApi.getDiff(), []);
}

export function useRunAudit() {
  return useMutation(() => auditsApi.run());
}
