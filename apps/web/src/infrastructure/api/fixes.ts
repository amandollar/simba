import type { FixProof } from "@/domain/types";
import { apiClient } from "./client";

export const fixesApi = {
  list: (limit = 20) =>
    apiClient.get<FixProof[]>(`/fixes?limit=${limit}`),
};
