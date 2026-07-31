export type ScoreTone = "danger" | "warning" | "good" | "excellent";

export function getScoreTier(score: number) {
  if (score >= 80) return { label: "Excellent", tone: "excellent" as const };
  if (score >= 60) return { label: "Good", tone: "good" as const };
  if (score >= 40) return { label: "Fair", tone: "warning" as const };
  return { label: "Needs work", tone: "danger" as const };
}

export const scoreToneStyles: Record<
  ScoreTone,
  { ring: string; text: string; bar: string }
> = {
  danger: {
    ring: "#dc2626",
    text: "text-foreground",
    bar: "bg-danger",
  },
  warning: {
    ring: "#737373",
    text: "text-foreground",
    bar: "bg-muted",
  },
  good: {
    ring: "#404040",
    text: "text-foreground",
    bar: "bg-foreground/70",
  },
  excellent: {
    ring: "#171717",
    text: "text-foreground",
    bar: "bg-foreground",
  },
};
