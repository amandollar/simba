import { useAuth } from "@clerk/clerk-react";
import { useCallback, useEffect, useState } from "react";
import type { Merchant } from "@/domain/types";
import { merchantApi } from "@/infrastructure/api";
import { ApiError } from "@/infrastructure/api/client";

type BootstrapState =
  | { status: "loading"; merchant: null; error: null }
  | { status: "ready"; merchant: Merchant | null; error: null }
  | { status: "error"; merchant: null; error: string };

const TOKEN_RETRIES = 6;
const TOKEN_RETRY_MS = 250;

export function useMerchantBootstrap() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [state, setState] = useState<BootstrapState>({
    status: "loading",
    merchant: null,
    error: null,
  });

  const load = useCallback(async () => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setState({ status: "ready", merchant: null, error: null });
      return;
    }

    setState({ status: "loading", merchant: null, error: null });

    for (let attempt = 0; attempt < TOKEN_RETRIES; attempt++) {
      const token = await getToken().catch(() => null);
      if (!token) {
        await new Promise((resolve) => setTimeout(resolve, TOKEN_RETRY_MS));
        continue;
      }

      try {
        const merchant = await merchantApi.me();
        setState({ status: "ready", merchant, error: null });
        return;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401 && attempt < TOKEN_RETRIES - 1) {
          await new Promise((resolve) => setTimeout(resolve, TOKEN_RETRY_MS));
          continue;
        }

        setState({
          status: "error",
          merchant: null,
          error:
            err instanceof TypeError && err.message === "Failed to fetch"
              ? "Could not reach the API. Make sure the backend is running on port 4000."
              : err instanceof Error
                ? err.message
                : "Could not load your account. Please try again.",
        });
        return;
      }
    }

    setState({
      status: "error",
      merchant: null,
      error: "Session is still starting. Please try again.",
    });
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
