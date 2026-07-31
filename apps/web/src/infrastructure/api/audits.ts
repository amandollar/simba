import type { AuditDiff, AuditRescanStatus, AuditRunResult, AuditSummary } from "@/domain/types";
import { apiClient } from "./client";

export const auditsApi = {
  run: () => apiClient.post<AuditRunResult>("/audits"),

  getLatest: () => apiClient.get<AuditRunResult | null>("/audits"),

  getAll: () => apiClient.get<AuditSummary[]>("/audits?all=true"),

  getDiff: () => apiClient.get<AuditDiff | null>("/audits/diff"),

  getDiffForAudit: (id: string) =>
    apiClient.get<AuditDiff>(`/audits/${id}/diff`),

  getRescanStatus: () =>
    apiClient.get<AuditRescanStatus>("/audits/rescan-status"),
};
