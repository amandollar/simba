import { Link } from "react-router-dom";
import {
  Icon,
  MessageCircle,
  Package,
  Shield,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  Wand2,
} from "@/presentation/components/ui/Icon";
import { SimbaLogo } from "@/presentation/components/ui/SimbaLogo";
import "./landing.css";

const stats = [
  { value: "5", label: "Specialist agents" },
  { value: "1-click", label: "Fix application" },
  { value: "<10 min", label: "First audit" },
  { value: "24/7", label: "AI consultant" },
];

const bento = [
  {
    icon: Store,
    title: "Storefront that sells",
    description:
      "Custom URL, branding, catalog, checkout, and reviews — everything shoppers need, nothing they don't.",
    className: "sm:col-span-2",
    accent: false,
  },
  {
    icon: Sparkles,
    title: "Multi-agent audits",
    description:
      "UX, SEO, accessibility, conversion, and trust — scanned in parallel, ranked by impact.",
    className: "",
    accent: true,
  },
  {
    icon: Wand2,
    title: "Validated auto-fixes",
    description:
      "Agents propose changes, a validator checks them, then Simba applies — with proof.",
    className: "",
    accent: false,
  },
  {
    icon: MessageCircle,
    title: "Always-on consultant",
    description:
      "Ask about priorities, launch readiness, or catalog strategy — routed to the right specialist.",
    className: "sm:col-span-2",
    accent: false,
  },
];

const agents = [
  { name: "UX Lens", role: "Layout & clarity", icon: Target },
  { name: "SEO Lens", role: "Discoverability", icon: TrendingUp },
  { name: "Trust Lens", role: "Credibility", icon: Shield },
  { name: "Conversion", role: "Revenue gaps", icon: Package },
  { name: "Strategist", role: "Executive summary", icon: Sparkles },
];

const steps = [
  {
    num: "01",
    title: "Create & customize",
    body: "Name your store, claim your URL, upload branding, and list your first products.",
  },
  {
    num: "02",
    title: "Scan with agents",
    body: "Simba's specialist team audits your live storefront and builds a prioritized playbook.",
  },
  {
    num: "03",
    title: "Launch & iterate",
    body: "Go live, chat with your consultant, apply fixes, and watch your health score rise.",
  },
];

const quotes = [
  {
    text: "I launched Saturday morning. By Sunday night Simba had found twelve things I'd never have caught myself.",
    author: "Maya R.",
    role: "Ceramics studio",
  },
  {
    text: "It's like having a growth team that actually reads my product pages — not generic advice.",
    author: "James K.",
    role: "Outdoor gear",
  },
];

const marqueeItems = [
  "Store builder",
  "AI audit agents",
  "One-click fixes",
  "Launch checklist",
  "Guest checkout",
  "AI consultant",
  "Health scoring",
  "Auto re-scan",
];

function LandingNav() {
  return (
    <header className="landing-nav fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="landing-glass flex items-center gap-2.5 rounded-full px-3 py-1.5 transition-opacity hover:opacity-90"
        >
          <SimbaLogo size={26} className="rounded-md" />
          <span className="text-sm font-medium text-white/90">Simba</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a href="#features" className="transition-colors hover:text-white">
            Features
          </a>
          <a href="#agents" className="transition-colors hover:text-white">
            AI agents
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-white">
            How it works
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/sign-in"
            className="hidden rounded-full px-4 py-2 text-sm text-white/70 transition-colors hover:text-white sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            to="/sign-in"
            className="landing-btn-glow rounded-full bg-simba px-4 py-2 text-sm font-medium text-white transition-all hover:bg-simba-hover"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroMockup() {
  return (
    <div className="landing-fade-up landing-fade-up-delay-3 relative mx-auto mt-10 max-w-4xl sm:mt-12 lg:max-w-5xl">
      <div className="landing-card-glow overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/90 backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-white/8 bg-white/4 px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-red-400/80" />
          <span className="h-2 w-2 rounded-full bg-amber-400/80" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
          <span className="ml-2 text-[11px] text-white/40">app.simba.store/simba</span>
        </div>
        <div className="grid sm:grid-cols-[180px_1fr]">
          <aside className="hidden border-r border-white/8 bg-black/20 p-4 sm:block">
            <div className="flex items-center gap-2">
              <SimbaLogo size={20} className="rounded-sm" />
              <span className="text-xs font-medium text-white/80">Acme Studio</span>
            </div>
            <div className="mt-6 space-y-1">
              {["Overview", "Issues", "Consultant", "Products"].map((item, i) => (
                <div
                  key={item}
                  className={`rounded-lg px-2.5 py-2 text-xs ${
                    i === 0
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/45"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-indigo-300/80">
                  Health score
                </p>
                <p className="landing-display mt-1 text-4xl text-white">84</p>
                <p className="mt-1 text-xs text-emerald-400">↑ 14 since last scan</p>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
                Live
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                  Top priority
                </p>
                <p className="mt-1.5 text-sm font-medium text-white/90">
                  Hero missing trust signals
                </p>
                <p className="mt-1 text-xs text-white/45">Trust agent · High impact</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                  Quick win
                </p>
                <p className="mt-1.5 text-sm font-medium text-white/90">
                  2 products uncategorized
                </p>
                <p className="mt-1 text-xs text-indigo-300">Fix available →</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20">
                  <Icon icon={MessageCircle} size={16} className="text-indigo-300" />
                </div>
                <div>
                  <p className="text-xs font-medium text-indigo-200">AI Consultant</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">
                    Your checkout flow is solid. I&apos;d add social proof above the fold on
                    your top SKU — want me to draft the copy?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-indigo-500/20 blur-3xl"
        aria-hidden
      />
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="landing">
      <LandingNav />

      <section className="landing-hero relative overflow-hidden pb-0 pt-24 sm:pt-28">
        <div className="landing-mesh pointer-events-none absolute inset-0" aria-hidden />
        <div className="landing-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="landing-shine pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div className="landing-hero-fade pointer-events-none absolute inset-x-0 bottom-0 h-48 sm:h-56" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="landing-fade-up landing-glass mx-auto inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-indigo-200/90">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-400" />
              </span>
              Store builder + AI agent orchestra
            </p>
            <h1 className="landing-display landing-fade-up landing-fade-up-delay-1 mt-6 text-4xl leading-[1.08] text-white sm:text-5xl lg:text-[3.25rem]">
              Launch your store.
              <span className="mt-2 block bg-gradient-to-r from-indigo-200 via-white to-violet-200 bg-clip-text text-transparent">
                Grow it with AI agents.
              </span>
            </h1>
            <p className="landing-fade-up landing-fade-up-delay-2 mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/60">
              Simba gives independent sellers a premium storefront and a specialist
              agent team that audits, advises, and fixes — so you ship faster and sell
              smarter.
            </p>
            <div className="landing-fade-up landing-fade-up-delay-2 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/sign-in"
                className="landing-btn-glow inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-zinc-900 transition-all hover:bg-white/90 sm:w-auto"
              >
                Launch your store — free
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/15 px-8 text-sm font-medium text-white/80 transition-colors hover:border-white/25 hover:bg-white/5 sm:w-auto"
              >
                See how it works
              </a>
            </div>
          </div>
          <HeroMockup />
        </div>
      </section>

      <section className="relative z-10 border-b border-border bg-surface py-5">
        <div className="flex whitespace-nowrap">
          <div className="landing-marquee flex gap-12 px-6">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="flex items-center gap-3 text-sm text-muted"
              >
                <span className="h-1 w-1 rounded-full bg-simba/60" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:grid-cols-4 sm:px-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="landing-display text-3xl text-foreground sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-simba">
              Platform
            </p>
            <h2 className="landing-display mt-4 text-3xl text-foreground sm:text-4xl lg:text-5xl">
              Everything to sell.
              <span className="block text-muted">Nothing you don&apos;t need.</span>
            </h2>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {bento.map((item) => (
              <div
                key={item.title}
                className={`landing-bento group relative overflow-hidden rounded-2xl border border-border p-6 transition-shadow hover:shadow-lg ${item.className} ${
                  item.accent ? "border-simba/20 bg-simba-soft/30" : "bg-surface-raised"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-raised text-simba shadow-sm">
                  <Icon icon={item.icon} size={20} />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="agents"
        className="border-y border-border bg-zinc-950 py-20 text-white sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300/80">
                AI agent team
              </p>
              <h2 className="landing-display mt-4 text-3xl sm:text-4xl lg:text-5xl">
                Not a chatbot.
                <span className="block text-white/50">A specialist orchestra.</span>
              </h2>
              <p className="mt-6 leading-relaxed text-white/55">
                Five lens agents scan your store in parallel. A triage agent dedupes
                findings. A strategist writes your executive brief. A consultant routes
                your questions to the right expert.
              </p>
              <Link
                to="/sign-in"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-indigo-300 transition-colors hover:text-indigo-200"
              >
                Meet your agents
                <span aria-hidden>→</span>
              </Link>
            </div>
            <ul className="space-y-3">
              {agents.map((agent) => (
                <li
                  key={agent.name}
                  className="landing-glass flex items-center gap-4 rounded-xl px-4 py-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/8">
                    <Icon icon={agent.icon} size={18} className="text-indigo-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-white/45">{agent.role}</p>
                  </div>
                  <span className="hidden text-xs text-white/30 sm:inline">Active</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-simba">
              How it works
            </p>
            <h2 className="landing-display mt-4 text-3xl text-foreground sm:text-4xl">
              Zero to launched in one session
            </h2>
          </div>
          <ol className="mt-14 grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <li
                key={step.num}
                className="rounded-2xl border border-border bg-surface-raised p-6 sm:p-7"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-simba-soft text-sm font-semibold tabular-nums text-simba">
                  {step.num}
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-border bg-surface-overlay py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted">
            Early sellers
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {quotes.map((q) => (
              <blockquote
                key={q.author}
                className="rounded-2xl border border-border bg-surface-raised p-8"
              >
                <p className="landing-display text-xl leading-snug text-foreground">
                  &ldquo;{q.text}&rdquo;
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-simba-soft text-xs font-semibold text-simba">
                    {q.author[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{q.author}</p>
                    <p className="text-xs text-muted">{q.role}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-cta-dark relative overflow-hidden py-20 sm:py-28">
        <div className="landing-mesh pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <SimbaLogo size={48} className="mx-auto rounded-xl ring-2 ring-white/10" />
          <h2 className="landing-display mt-8 text-4xl text-white sm:text-5xl">
            Your store deserves a team.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/55">
            Join sellers who launch in minutes and improve every day — with AI agents
            that actually know their catalog.
          </p>
          <Link
            to="/sign-in"
            className="landing-btn-glow mt-10 inline-flex h-12 items-center justify-center rounded-full bg-white px-10 text-sm font-semibold text-zinc-900 transition-all hover:bg-white/90"
          >
            Get started — it&apos;s free
          </Link>
          <p className="mt-4 text-xs text-white/35">
            No credit card · Google sign-in · Setup in under 10 minutes
          </p>
        </div>
      </section>

      <footer className="border-t border-white/8 bg-zinc-950 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <SimbaLogo size={22} className="rounded-md opacity-80" />
            <span className="text-sm text-white/50">
              Simba — store builder with AI agents
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/35">
            <Link to="/sign-in" className="transition-colors hover:text-white/60">
              Sign in
            </Link>
            <span>© {new Date().getFullYear()} Simba</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
