export interface LaunchCheckItem {
  id: string;
  label: string;
  passed: boolean;
  hint?: string;
}

export interface LaunchReadiness {
  ready: boolean;
  passedCount: number;
  totalCount: number;
  items: LaunchCheckItem[];
}

export const LAUNCH_CHECK_LINKS: Record<string, string> = {
  products: "/products",
  images: "/products",
  categories: "/products",
  description: "/store",
  "urgent-issues": "/simba",
};
