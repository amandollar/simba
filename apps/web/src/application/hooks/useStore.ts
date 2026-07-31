import { consultantApi, merchantApi, storeApi } from "@/infrastructure/api";
import { useAsyncData, useMutation } from "./useAsync";

export function useMerchant() {
  return useAsyncData(() => merchantApi.me(), []);
}

export function useProducts() {
  return useAsyncData(() => storeApi.products(), []);
}

export function useOrders() {
  return useAsyncData(() => storeApi.orders(), []);
}

export function useOrder(id: string | undefined) {
  return useAsyncData(async () => {
    if (!id) return null;
    return storeApi.order(id);
  }, [id]);
}

export function useCustomers() {
  return useAsyncData(() => storeApi.customers(), []);
}

export function useAnalytics() {
  return useAsyncData(() => storeApi.analytics(), []);
}

export function useReviews() {
  return useAsyncData(() => storeApi.reviews(), []);
}

export function useConsultant() {
  return useMutation((message: string) => consultantApi.ask(message));
}

export function useCreateProduct(onSuccess?: () => void) {
  return useMutation(
    (data: Parameters<typeof storeApi.createProduct>[0]) =>
      storeApi.createProduct(data).then((r) => {
        onSuccess?.();
        return r;
      })
  );
}

export function useUpdateProduct(onSuccess?: () => void) {
  return useMutation(
    ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof storeApi.updateProduct>[1];
    }) =>
      storeApi.updateProduct(id, data).then((r) => {
        onSuccess?.();
        return r;
      })
  );
}

export function useDeleteProduct(onSuccess?: () => void) {
  return useMutation((id: string) =>
    storeApi.deleteProduct(id).then(() => {
      onSuccess?.();
      return true;
    })
  );
}

export function useLaunchReadiness(enabled = true) {
  return useAsyncData(async () => {
    if (!enabled) return null;
    return merchantApi.launchReadiness();
  }, [enabled]);
}

export function useLaunchStore(onSuccess?: () => void) {
  return useMutation(() =>
    merchantApi.launch().then((r) => {
      onSuccess?.();
      return r;
    })
  );
}

export function useUpdateStore(onSuccess?: () => void) {
  return useMutation(
    (data: Parameters<typeof merchantApi.update>[0]) =>
      merchantApi.update(data).then((r) => {
        onSuccess?.();
        return r;
      })
  );
}
