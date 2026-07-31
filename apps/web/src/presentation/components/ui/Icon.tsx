import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  ArrowLeft,
  BarChart3,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  History,
  LineChart,
  LogOut,
  MessageCircle,
  Minus,
  Package,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Target,
  Trash2,
  TrendingUp,
  Users,
  Wand2,
  X,
} from "lucide-react";

export {
  Accessibility,
  ArrowLeft,
  BarChart3,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  History,
  LineChart,
  LogOut,
  MessageCircle,
  Minus,
  Package,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Target,
  Trash2,
  TrendingUp,
  Users,
  Wand2,
  X,
};

export function Icon({
  icon: IconComponent,
  size = 20,
  className = "",
}: {
  icon: LucideIcon;
  size?: number;
  className?: string;
}) {
  return (
    <IconComponent
      size={size}
      strokeWidth={1.75}
      className={className}
      aria-hidden
    />
  );
}

export function IconBox({
  icon: IconComponent,
  size = 22,
  className = "",
}: {
  icon: LucideIcon;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] border border-border bg-surface-overlay text-muted ${className}`}
    >
      <IconComponent size={size} strokeWidth={1.75} aria-hidden />
    </div>
  );
}
