import { db } from "./db.js";

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

export async function computeLaunchReadiness(
  merchantId: string
): Promise<LaunchReadiness> {
  const [merchant, products, latestAudit] = await Promise.all([
    db.merchant.findUniqueOrThrow({
      where: { id: merchantId },
      select: { description: true },
    }),
    db.product.findMany({
      where: { merchantId },
      select: { images: true, category: true },
    }),
    db.audit.findFirst({
      where: { merchantId },
      orderBy: { createdAt: "desc" },
      include: {
        issues: {
          where: { status: "open", severity: "critical" },
          select: { id: true },
        },
      },
    }),
  ]);

  const withoutImages = products.filter((p) => p.images.length === 0).length;
  const uncategorized = products.filter((p) => !p.category?.trim()).length;
  const urgentCount = latestAudit?.issues.length ?? 0;

  const items: LaunchCheckItem[] = [
    {
      id: "products",
      label: "At least one product",
      passed: products.length > 0,
      hint:
        products.length === 0 ? "Add a product from the Products page" : undefined,
    },
    {
      id: "images",
      label: "Every product has a photo",
      passed: products.length > 0 && withoutImages === 0,
      hint:
        products.length === 0
          ? undefined
          : withoutImages > 0
            ? `${withoutImages} product(s) still need images`
            : undefined,
    },
    {
      id: "categories",
      label: "Every product has a category",
      passed: products.length > 0 && uncategorized === 0,
      hint:
        products.length === 0
          ? undefined
          : uncategorized > 0
            ? `${uncategorized} product(s) need a category`
            : undefined,
    },
    {
      id: "description",
      label: "Store description added",
      passed: Boolean(merchant.description?.trim()),
      hint: !merchant.description?.trim()
        ? "Add a short description on Store details"
        : undefined,
    },
    {
      id: "urgent-issues",
      label: "No urgent issues on your latest scan",
      passed: Boolean(latestAudit) && urgentCount === 0,
      hint: !latestAudit
        ? "Run a scan on Simba Overview first"
        : urgentCount > 0
          ? `${urgentCount} urgent issue(s) to fix first`
          : undefined,
    },
  ];

  const passedCount = items.filter((i) => i.passed).length;

  return {
    ready: passedCount === items.length,
    passedCount,
    totalCount: items.length,
    items,
  };
}
