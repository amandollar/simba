import { fixesApi } from "@/infrastructure/api";
import { useAsyncData } from "./useAsync";

export function useFixHistory(limit = 10) {
  return useAsyncData(() => fixesApi.list(limit), [limit]);
}
