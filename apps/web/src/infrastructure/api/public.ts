import type { Order, PublicProduct, PublicStore, Review } from "@/domain/types";
import { env } from "@/config/env";

async function publicRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

export const publicApi = {
  store: (slug: string) => publicRequest<PublicStore>(`/public/${slug}`),

  product: (slug: string, productId: string) =>
    publicRequest<PublicProduct>(`/public/${slug}/products/${productId}`),

  checkout: (
    slug: string,
    data: {
      name: string;
      email: string;
      items: Array<{ productId: string; quantity: number }>;
    }
  ) => publicRequest<Order>(`/public/${slug}/checkout`, {
    method: "POST",
    body: JSON.stringify(data),
  }),

  submitReview: (
    slug: string,
    productId: string,
    data: { authorName: string; rating: number; body: string }
  ) =>
    publicRequest<Review>(`/public/${slug}/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
