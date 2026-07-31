import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { LoadingState } from "@/presentation/components/ui/States";
import { LandingPage } from "@/presentation/pages/marketing/LandingPage";

export function LandingRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <LoadingState label="Loading..." />;
  if (isSignedIn) return <Navigate to="/auth/continue" replace />;

  return <LandingPage />;
}
