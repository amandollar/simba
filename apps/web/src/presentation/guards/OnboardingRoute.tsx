import { Navigate } from "react-router-dom";
import { useMerchant } from "@/application/hooks";
import { LoadingState } from "@/presentation/components/ui/States";
import { OnboardingPage } from "@/presentation/pages/onboarding/OnboardingPage";

export function OnboardingRoute() {
  const { data: merchant, loading } = useMerchant();

  if (loading) return <LoadingState label="Loading..." />;
  if (merchant) return <Navigate to="/getting-started" replace />;

  return <OnboardingPage />;
}
