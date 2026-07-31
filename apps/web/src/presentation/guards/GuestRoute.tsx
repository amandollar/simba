import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { LoadingState } from "@/presentation/components/ui/States";

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <LoadingState label="Loading..." />;
  if (isSignedIn) return <Navigate to="/auth/continue" replace />;

  return children;
}
