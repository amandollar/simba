import type { LucideIcon } from "lucide-react";
import { getScoreTier, scoreToneStyles } from "@/domain/scores";
import { Icon } from "@/presentation/components/ui/Icon";

const TRACK = "#e5e5e5";

export function ScoreRing({
  score,
  size = 80,
  strokeWidth,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const stroke = strokeWidth ?? Math.max(4, size * 0.06);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const offset = circumference - (progress / 100) * circumference;
  const { tone } = getScoreTier(score);
  const color = scoreToneStyles[tone].ring;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={TRACK}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-semibold leading-none tracking-tight text-foreground"
          style={{ fontSize: size * 0.22 }}
        >
          {score}
        </span>
      </div>
    </div>
  );
}

export function ScoreBar({
  label,
  score,
  icon,
}: {
  label: string;
  score: number;
  icon?: LucideIcon;
}) {
  const { tone } = getScoreTier(score);
  const styles = scoreToneStyles[tone];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm text-foreground">
          {icon && <Icon icon={icon} size={15} className="text-muted" />}
          {label}
        </span>
        <span className="text-sm font-medium tabular-nums text-foreground">
          {score}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-surface-overlay">
        <div
          className={`h-full rounded-full ${styles.bar}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreCard({
  label,
  score,
  large,
}: {
  label: string;
  score: number;
  large?: boolean;
}) {
  const { label: tierLabel } = getScoreTier(score);

  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface-raised p-4">
      <ScoreRing score={score} size={large ? 96 : 64} />
      <div className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
          {label}
        </p>
        <p className="mt-0.5 text-xs text-muted">{tierLabel}</p>
      </div>
    </div>
  );
}
