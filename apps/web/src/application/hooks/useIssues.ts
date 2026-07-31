import { issuesApi } from "@/infrastructure/api";
import type { FixResult, IssueStatus } from "@/domain/types";
import { useAsyncData, useMutation } from "./useAsync";

export function useIssues(status?: IssueStatus) {
  return useAsyncData(() => issuesApi.list(status), [status]);
}

export function useIssueActions(onSuccess?: () => void) {
  const updateStatus = useMutation((id: string, status: IssueStatus) =>
    issuesApi.updateStatus(id, status).then((r) => {
      onSuccess?.();
      return r;
    })
  );

  const applyFix = useMutation(
    (
      id: string,
      apply: boolean,
      productId?: string,
      changes?: NonNullable<FixResult["changes"]>
    ) =>
      issuesApi.generateFix(id, apply, productId, changes).then((r) => {
        if (apply) onSuccess?.();
        return r;
      })
  );

  return { updateStatus, applyFix };
}
