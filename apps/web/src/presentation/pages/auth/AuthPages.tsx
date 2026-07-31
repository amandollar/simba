import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AuthenticateWithRedirectCallback,
  useSignIn,
  useSignUp,
} from "@clerk/clerk-react";
import { Button } from "@/presentation/components/ui/Button";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import {
  Icon,
  Check,
  Sparkles,
  Store,
  Wand2,
} from "@/presentation/components/ui/Icon";
import { LoadingState } from "@/presentation/components/ui/States";
import { SimbaLogo } from "@/presentation/components/ui/SimbaLogo";
import "@/presentation/pages/marketing/landing.css";

const SSO_CALLBACK_PATH = "/sign-in/sso-callback";
const AUTH_CONTINUE_PATH = "/auth/continue";

const perks = [
  { icon: Store, text: "Launch a branded storefront in minutes" },
  { icon: Sparkles, text: "5 AI agents audit UX, SEO, and conversion" },
  { icon: Wand2, text: "Apply validated fixes with one click" },
];

function authRedirectUrl(path: string) {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

function AuthBrandPanel() {
  return (
    <aside className="landing-hero relative hidden overflow-hidden lg:flex lg:w-[44%] xl:w-[42%]">
      <div className="landing-mesh pointer-events-none absolute inset-0" aria-hidden />
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
        <Link
          to="/"
          className="landing-glass inline-flex w-fit items-center gap-2.5 rounded-full px-3 py-1.5 transition-opacity hover:opacity-90"
        >
          <SimbaLogo size={24} className="rounded-md" />
          <span className="text-sm font-medium text-white/90">Simba</span>
        </Link>

        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300/80">
            For independent sellers
          </p>
          <h2 className="landing-display mt-4 text-4xl leading-tight text-white xl:text-5xl">
            Your store.
            <span className="mt-1 block text-white/55">Your AI growth team.</span>
          </h2>
          <ul className="mt-10 space-y-4">
            {perks.map((perk) => (
              <li key={perk.text} className="flex items-start gap-3 text-sm text-white/70">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8">
                  <Icon icon={perk.icon} size={15} className="text-indigo-300" />
                </span>
                {perk.text}
              </li>
            ))}
          </ul>
        </div>

        <blockquote className="max-w-sm border-l-2 border-indigo-400/40 pl-4">
          <p className="landing-display text-lg leading-snug text-white/80">
            &ldquo;Shipped my store Saturday. Simba found a dozen issues by Sunday.&rdquo;
          </p>
          <footer className="mt-3 text-xs text-white/40">— Early Simba seller</footer>
        </blockquote>
      </div>
    </aside>
  );
}

function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="landing flex min-h-screen bg-surface">
      <AuthBrandPanel />

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <SimbaLogo size={24} className="rounded-md" />
            <span className="text-sm font-semibold">Simba</span>
          </Link>
          <Link
            to="/"
            className="text-xs text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            Home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-[400px]">
            <Card className="shadow-sm">
              <CardBody className="space-y-6 p-6 sm:p-8">
                <div className="text-center lg:text-left">
                  <SimbaLogo
                    size={40}
                    className="mx-auto rounded-lg shadow-sm lg:mx-0"
                  />
                  <h1 className="mt-5 text-xl font-semibold tracking-tight">
                    {title}
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {description}
                  </p>
                </div>

                {children}

                <div className="space-y-4 border-t border-border pt-5">
                  <ul className="space-y-2 lg:hidden">
                    {perks.map((perk) => (
                      <li
                        key={perk.text}
                        className="flex items-center gap-2 text-xs text-muted"
                      >
                        <Icon icon={Check} size={14} className="shrink-0 text-simba" />
                        {perk.text}
                      </li>
                    ))}
                  </ul>
                  <p className="text-center text-xs text-muted lg:text-left">
                    No credit card · Free to start · Google sign-in
                  </p>
                  <Link
                    to="/"
                    className="block text-center text-sm text-muted underline-offset-4 hover:text-foreground hover:underline lg:text-left"
                  >
                    ← Back to home
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GoogleAuthButton() {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReady = signInLoaded && signUpLoaded;

  async function handleGoogle() {
    if (!isReady || !signIn || !signUp) return;

    setLoading(true);
    setError(null);

    const redirectUrl = authRedirectUrl(SSO_CALLBACK_PATH);
    const redirectUrlComplete = authRedirectUrl(AUTH_CONTINUE_PATH);
    const options = {
      strategy: "oauth_google" as const,
      redirectUrl,
      redirectUrlComplete,
    };

    try {
      await signIn.authenticateWithRedirect(options);
    } catch (err) {
      try {
        await signUp.authenticateWithRedirect(options);
      } catch (fallbackErr) {
        const message =
          fallbackErr instanceof Error
            ? fallbackErr.message
            : err instanceof Error
              ? err.message
              : "Could not start Google sign-in";

        setError(message);
        setLoading(false);
      }
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="secondary"
        className="h-11 w-full border-border-strong text-sm font-medium shadow-sm"
        onClick={handleGoogle}
        disabled={!isReady || loading}
      >
        <GoogleIcon />
        {loading ? "Redirecting to Google…" : "Continue with Google"}
      </Button>
      {error && <p className="text-center text-sm text-danger">{error}</p>}
    </div>
  );
}

export function SignInPage() {
  return (
    <AuthShell
      title="Welcome to Simba"
      description="Sign in or create an account — you'll set up your store right after."
    >
      <GoogleAuthButton />
    </AuthShell>
  );
}

export function SsoCallbackPage() {
  return (
    <AuthShell
      title="Signing you in"
      description="Finishing your Google sign-in. This only takes a moment."
    >
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl={AUTH_CONTINUE_PATH}
        signUpFallbackRedirectUrl={AUTH_CONTINUE_PATH}
      />
      <LoadingState label="Completing sign-in..." />
    </AuthShell>
  );
}
