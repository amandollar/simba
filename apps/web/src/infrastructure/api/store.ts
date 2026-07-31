import type {
  ConsultantReply,
  CopyOptimizationResult,
  Customer,
  Order,
  Product,
  ProductFieldChanges,
  Review,
  StoreAnalytics,
} from "@/domain/types";
import { apiClient } from "./client";

export const storeApi = {
  products: () => apiClient.get<Product[]>("/store/products"),

  createProduct: (data: {
    title: string;
    description?: string;
    price: number;
    category?: string;
    images?: string[];
    altText?: string;
  }) => apiClient.post<Product>("/store/products", data),

  updateProduct: (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      price: number;
      category: string;
      images: string[];
      altText: string;
    }>
  ) => apiClient.patch<Product>(`/store/products/${id}`, data),

  deleteProduct: (id: string) => apiClient.delete(`/store/products/${id}`),

  optimizeCopy: (
    id: string,
    options?: { apply?: boolean; changes?: ProductFieldChanges }
  ) =>
    apiClient.post<CopyOptimizationResult>(
      `/store/products/${id}/optimize-copy`,
      options ?? {}
    ),

  orders: () => apiClient.get<Order[]>("/store/orders"),

  order: (id: string) => apiClient.get<Order>(`/store/orders/${id}`),

  customers: () => apiClient.get<Customer[]>("/store/customers"),

  reviews: () => apiClient.get<Review[]>("/store/reviews"),

  analytics: () => apiClient.get<StoreAnalytics>("/store/analytics"),

  categories: () => apiClient.get<string[]>("/store/categories"),
};

export const consultantApi = {
  ask: (message: string) =>
    apiClient.post<ConsultantReply>("/consultant", { message }),
};

export const healthApi = {
  check: () => apiClient.get<{ status: string }>("/health"),
};
