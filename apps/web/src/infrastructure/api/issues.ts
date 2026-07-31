import type { FixResult, Issue, IssueStatus } from "@/domain/types";
import { apiClient } from "./client";

type FixChanges = NonNullable<FixResult["changes"]>;

export const issuesApi = {
  list: (status?: IssueStatus) => {
    const params = status ? `?status=${status}` : "";
    return apiClient.get<Issue[]>(`/issues${params}`);
  },

  updateStatus: (id: string, status: IssueStatus) =>
    apiClient.patch<Issue>(`/issues/${id}`, { status }),

  generateFix: (
    id: string,
    apply = false,
    productId?: string,
    changes?: FixChanges
  ) => apiClient.post<FixResult>(`/issues/${id}/fix`, { apply, productId, changes }),
};
