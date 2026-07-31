import { Link, NavLink, Outlet } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import type { LucideIcon } from "lucide-react";
import { ExternalLink } from "lucide-react";
import { useLatestAudit, useMerchant } from "@/application/hooks";
import { storefrontPath, storefrontUrl } from "@/domain/storefront-url";
import {
  BarChart3,
  Icon,
  Package,
  Palette,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Users,
} from "@/presentation/components/ui/Icon";
import { SimbaLogo } from "@/presentation/components/ui/SimbaLogo";
import { LogoutButton } from "@/presentation/components/auth/LogoutButton";

const storeNav: {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}[] = [
  { to: "/store", label: "Store details", icon: Store, end: true },
  { to: "/store/customize", label: "Customize", icon: Palette },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/products", label: "Products", icon: Package },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/reviews", label: "Reviews", icon: Star },
];

export function StoreShellLayout() {
  const { data: merchant } = useMerchant();
  const { data: audit } = useLatestAudit();
  const storeHref = merchant?.slug ? storefrontPath(merchant.slug) : null;
  const storeUrl = merchant?.slug ? storefrontUrl(merchant.slug) : null;
  const showGettingStarted = merchant && !audit;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-border bg-surface-raised md:w-64 md:border-b-0 md:border-r">
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/simba"
              className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <SimbaLogo size={24} className="shrink-0 rounded-sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight">
                  {merchant?.name ?? "Simba"}
                </p>
                <p className="truncate text-[11px] text-muted">Store admin</p>
              </div>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        <nav className="flex flex-1 gap-0.5 overflow-x-auto p-2 scroll-smooth scroll-px-2 scrollbar-thin md:flex-col md:overflow-visible">
          {showGettingStarted && (
            <>
              <NavLink
                to="/getting-started"
                className={({ isActive }) => navClass(isActive)}
              >
                <Icon icon={Sparkles} size={16} className="shrink-0 text-simba" />
                <span className="text-simba">Get started</span>
              </NavLink>
              <div className="mx-2 my-1.5 hidden h-px bg-border md:block" />
            </>
          )}

          <p className="hidden shrink-0 px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted md:block">
            Manage
          </p>
          {storeNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => navClass(isActive)}
            >
              <Icon icon={item.icon} size={16} className="shrink-0 opacity-70" />
              {item.label}
            </NavLink>
          ))}

          <div className="mx-2 my-2 hidden h-px bg-border md:block" />

          <NavLink
            to="/simba"
            className={({ isActive }) =>
              `${navClass(isActive)} ${isActive ? "!bg-simba-soft" : ""}`
            }
          >
            <SimbaLogo size={16} className="shrink-0 rounded-sm" />
            Simba AI
          </NavLink>
        </nav>

        <div className="mt-auto border-t border-border p-4">
          <LogoutButton className="h-8 w-full justify-start px-3 text-xs md:w-full" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-surface-raised/80 px-4 py-3 backdrop-blur-sm sm:gap-4 sm:px-8">
          <p className="truncate text-xs text-muted">
            {merchant?.launchedAt ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Live storefront
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                Draft — not visible to shoppers
              </span>
            )}
          </p>
          {storeHref && storeUrl && (
            <a
              href={storeHref}
              target="_blank"
              rel="noopener noreferrer"
              title={storeUrl}
              className="inline-flex min-w-0 max-w-[85%] items-center gap-2 rounded-[var(--radius-control)] border border-border bg-surface-raised px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-border-strong sm:max-w-none sm:px-3"
            >
              <span className="shrink-0 text-muted">
                {merchant?.launchedAt ? "View store" : "Preview store"}
              </span>
              <span className="hidden truncate text-foreground sm:inline">
                {storeUrl.replace(/^https?:\/\//, "")}
              </span>
              <Icon icon={ExternalLink} size={12} className="shrink-0 opacity-70" />
            </a>
          )}
        </header>
        <main className="min-w-0 flex-1 overflow-auto px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function navClass(isActive: boolean) {
  return `flex shrink-0 items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2 text-sm whitespace-nowrap transition-colors md:shrink ${
    isActive
      ? "bg-surface-overlay font-medium text-foreground shadow-sm"
      : "text-muted hover:bg-surface-overlay hover:text-foreground"
  }`;
}
