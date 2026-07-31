export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000",
  clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "",
} as const;
