import { Navigate, Outlet } from "react-router-dom";
import { useMerchant } from "@/application/hooks";
import { ErrorState, LoadingState } from "@/presentation/components/ui/States";

export function OnboardingGate() {
  const { data: merchant, loading, error, reload } = useMerchant();

  if (loading) return <LoadingState label="Loading your store..." />;

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!merchant) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}
