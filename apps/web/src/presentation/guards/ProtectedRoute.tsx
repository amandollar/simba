import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { LoadingState } from "@/presentation/components/ui/States";

export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <LoadingState label="Loading..." />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;

  return <Outlet />;
}
