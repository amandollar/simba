import type { LucideIcon } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useLatestAudit } from "@/application/hooks";
import { getScoreTier } from "@/domain/scores";
import {
  Icon,
  LineChart,
  MessageCircle,
  Sparkles,
  Target,
  TrendingUp,
} from "@/presentation/components/ui/Icon";
import { SimbaLogo } from "@/presentation/components/ui/SimbaLogo";

const simbaNav: {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  end?: boolean;
}[] = [
  {
    to: "/simba",
    label: "Audit center",
    description: "Run scans & view scores",
    icon: Sparkles,
    end: true,
  },
  {
    to: "/simba/issues",
    label: "Fixes",
    description: "What needs fixing",
    icon: Target,
  },
  {
    to: "/simba/growth",
    label: "Growth",
    description: "Campaigns & emails",
    icon: TrendingUp,
  },
  {
    to: "/simba/consultant",
    label: "Consultant",
    description: "Ask about your store",
    icon: MessageCircle,
  },
  {
    to: "/simba/timeline",
    label: "History",
    description: "Scans & fix proof",
    icon: LineChart,
  },
];

function WorkspaceNavItem({
  item,
  badge,
  compact,
}: {
  item: (typeof simbaNav)[number];
  badge?: number;
  compact?: boolean;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `group relative flex rounded-[var(--radius-card)] border transition-all ${
          compact
            ? "flex-col items-start gap-1 p-3"
            : "items-start gap-3 p-3"
        } ${
          isActive
            ? "border-simba/25 bg-simba-soft/50 shadow-sm"
            : "border-transparent bg-transparent hover:border-border hover:bg-surface-overlay"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute top-3 bottom-3 left-0 hidden w-0.5 rounded-full bg-simba md:block"
              aria-hidden
            />
          )}
          <div
            className={`flex shrink-0 items-center justify-center rounded-[var(--radius-control)] ${
              compact ? "h-8 w-8" : "h-9 w-9"
            } ${
              isActive
                ? "bg-simba text-white"
                : "bg-surface-overlay text-muted group-hover:text-foreground"
            }`}
          >
            <Icon icon={item.icon} size={compact ? 15 : 17} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  isActive ? "text-foreground" : "text-foreground/90"
                }`}
              >
                {item.label}
              </span>
              {badge !== undefined && badge > 0 && (
                <span className="rounded-full bg-simba px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </div>
            {!compact && (
              <p className="mt-0.5 text-xs leading-snug text-muted">
                {item.description}
              </p>
            )}
            {compact && (
              <p className="line-clamp-2 text-[11px] leading-snug text-muted">
                {item.description}
              </p>
            )}
          </div>
        </>
      )}
    </NavLink>
  );
}

export function SimbaLayout() {
  const { data: audit } = useLatestAudit();
  const openIssues =
    audit?.issues?.filter((i) => i.status === "open").length ?? 0;
  const scoreTier = audit ? getScoreTier(audit.overallScore) : null;
  const scoreDotClass = scoreTier
    ? {
        danger: "bg-danger",
        warning: "bg-warning",
        good: "bg-foreground/70",
        excellent: "bg-success",
      }[scoreTier.tone]
    : "";

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] bg-simba-soft">
            <SimbaLogo size={22} className="rounded-sm" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Simba AI</h1>
            <p className="text-xs text-muted">Your store intelligence workspace</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {audit && scoreTier && (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1.5 text-xs">
              <span
                className={`h-2 w-2 rounded-full ${scoreDotClass}`}
                aria-hidden
              />
              <span className="font-medium tabular-nums">
                {audit.overallScore}/100
              </span>
              <span className="text-muted">· {scoreTier.label}</span>
            </div>
          )}
          {openIssues > 0 && (
            <NavLink
              to="/simba/issues"
              className="inline-flex items-center gap-1.5 rounded-full border border-simba/20 bg-simba-soft px-3 py-1.5 text-xs font-medium text-simba transition-colors hover:bg-simba-soft/80"
            >
              {openIssues} to fix
            </NavLink>
          )}
        </div>
      </header>

      {/* Mobile: workspace tiles */}
      <nav
        className="grid grid-cols-2 gap-2 md:hidden"
        aria-label="Simba workspace"
      >
        {simbaNav.map((item) => (
          <WorkspaceNavItem
            key={item.to}
            item={item}
            compact
            badge={item.to === "/simba/issues" ? openIssues : undefined}
          />
        ))}
      </nav>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Desktop: side rail */}
        <aside className="hidden w-56 shrink-0 md:block">
          <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted">
            Workspace
          </p>
          <nav className="space-y-1" aria-label="Simba workspace">
            {simbaNav.map((item) => (
              <WorkspaceNavItem
                key={item.to}
                item={item}
                badge={item.to === "/simba/issues" ? openIssues : undefined}
              />
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
