import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { setTokenGetter } from "@/infrastructure/api";

export function ApiAuthBridge() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    setTokenGetter(async () => {
      if (!isSignedIn) return null;
      try {
        return await getToken();
      } catch (err) {
        console.error("Failed to get Clerk token:", err);
        return null;
      }
    });
  }, [getToken, isLoaded, isSignedIn]);

  return null;
}
