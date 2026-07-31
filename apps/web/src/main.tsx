import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { env } from "@/config/env";
import { ApiAuthBridge } from "@/application/AuthBridge";
import { App } from "./App";
import "./index.css";

if (!env.clerkPublishableKey) {
  console.warn("VITE_CLERK_PUBLISHABLE_KEY is not set");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={env.clerkPublishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-in"
      signInFallbackRedirectUrl="/auth/continue"
      signUpFallbackRedirectUrl="/auth/continue"
      afterSignInUrl="/auth/continue"
      afterSignUpUrl="/auth/continue"
      afterSignOutUrl="/"
    >
      <ApiAuthBridge />
      <App />
    </ClerkProvider>
  </StrictMode>
);
