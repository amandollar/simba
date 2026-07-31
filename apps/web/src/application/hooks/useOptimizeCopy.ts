import { storeApi } from "@/infrastructure/api";
import type { CopyOptimizationResult, ProductFieldChanges } from "@/domain/types";
import { useMutation } from "./useAsync";

export function useOptimizeCopy(onApplied?: () => void) {
  const preview = useMutation((productId: string) =>
    storeApi.optimizeCopy(productId)
  );

  const apply = useMutation(
    (productId: string, changes: ProductFieldChanges) =>
      storeApi
        .optimizeCopy(productId, { apply: true, changes })
        .then((result) => {
          onApplied?.();
          return result;
        })
  );

  return { preview, apply };
}

export type { CopyOptimizationResult };
