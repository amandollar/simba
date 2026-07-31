import { Navigate } from "react-router-dom";
import { useMerchantBootstrap } from "@/application/hooks/useMerchantBootstrap";
import { ErrorState, LoadingState } from "@/presentation/components/ui/States";

export function AuthContinueRoute() {
  const { status, merchant, error, reload } = useMerchantBootstrap();

  if (status === "loading") {
    return <LoadingState label="Setting up your account..." />;
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  return <Navigate to={merchant ? "/store" : "/onboarding"} replace />;
}
