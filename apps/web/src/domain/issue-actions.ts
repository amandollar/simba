import type { Issue, Product } from "./types";

export interface IssueAction {
  label: string;
  href: string;
}

function normalizeTitle(value: string) {
  return value.trim().toLowerCase();
}

function extractQuotedTitle(...texts: Array<string | null | undefined>) {
  for (const text of texts) {
    if (!text) continue;
    const match = text.match(/"([^"]+)"/);
    if (match?.[1]) return match[1];
  }
  return null;
}

function findProductByTitle(products: Product[], title: string) {
  const key = normalizeTitle(title);
  return products.find((p) => normalizeTitle(p.title) === key);
}

function firstProductMatching(
  products: Product[],
  predicate: (product: Product) => boolean
) {
  return products.find(predicate);
}

function productEditHref(productId: string, from?: string) {
  const base = `/products/${productId}/edit`;
  return from ? `${base}?from=${encodeURIComponent(from)}` : base;
}

type TitleMatcher = {
  test: (title: string) => boolean;
  resolve: (issue: Issue, products: Product[], from?: string) => IssueAction;
};

const TITLE_MATCHERS: TitleMatcher[] = [
  {
    test: (t) => t.includes("empty product catalog"),
    resolve: () => ({ label: "Add a product", href: "/products/new" }),
  },
  {
    test: (t) => t.includes("store not launched"),
    resolve: () => ({ label: "Go to store details", href: "/store" }),
  },
  {
    test: (t) => t.includes("store description"),
    resolve: () => ({ label: "Edit store description", href: "/store" }),
  },
  {
    test: (t) => t.includes("missing category"),
    resolve: (_issue, products, from) => {
      const target = firstProductMatching(
        products,
        (p) => !p.category?.trim()
      );
      return target
        ? {
            label: `Edit ${target.title}`,
            href: productEditHref(target.id, from),
          }
        : { label: "View products", href: "/products" };
    },
  },
  {
    test: (t) => t.includes("missing images"),
    resolve: (_issue, products, from) => {
      const target = firstProductMatching(
        products,
        (p) => p.images.length === 0
      );
      return target
        ? {
            label: `Add photos for ${target.title}`,
            href: productEditHref(target.id, from),
          }
        : { label: "View products", href: "/products" };
    },
  },
  {
    test: (t) => t.includes("missing alt text"),
    resolve: (_issue, products, from) => {
      const target = firstProductMatching(
        products,
        (p) => p.images.length > 0 && !p.altText?.trim()
      );
      return target
        ? {
            label: `Edit ${target.title}`,
            href: productEditHref(target.id, from),
          }
        : { label: "View products", href: "/products" };
    },
  },
  {
    test: (t) =>
      t.includes("placeholder titles") || t.includes("placeholder title"),
    resolve: (_issue, products, from) => {
      const target = firstProductMatching(products, (p) =>
        /^(product\s*name|untitled|new product|test|sample|lorem)/i.test(
          p.title.trim()
        )
      );
      return target
        ? {
            label: `Rename ${target.title}`,
            href: productEditHref(target.id, from),
          }
        : { label: "View products", href: "/products" };
    },
  },
  {
    test: (t) => t.includes("duplicate product titles"),
    resolve: () => ({ label: "View products", href: "/products" }),
  },
  {
    test: (t) => t.includes("lack detailed descriptions"),
    resolve: (_issue, products, from) => {
      const target = firstProductMatching(
        products,
        (p) => !p.description || p.description.trim().length < 40
      );
      return target
        ? {
            label: `Improve ${target.title}`,
            href: productEditHref(target.id, from),
          }
        : { label: "View products", href: "/products" };
    },
  },
  {
    test: (t) => t.includes("slow sellers"),
    resolve: (issue, products, from) => {
      const quoted = extractQuotedTitle(issue.description, issue.fixSummary);
      const target = quoted ? findProductByTitle(products, quoted) : undefined;
      return target
        ? {
            label: `Edit ${target.title}`,
            href: productEditHref(target.id, from),
          }
        : { label: "View products", href: "/products" };
    },
  },
  {
    test: (t) => t.includes("no sales since launch"),
    resolve: () => ({ label: "View analytics", href: "/analytics" }),
  },
  {
    test: (t) => t.includes("no customer reviews"),
    resolve: () => ({ label: "View reviews", href: "/reviews" }),
  },
  {
    test: (t) => t.includes("no repeat customers"),
    resolve: () => ({ label: "View customers", href: "/customers" }),
  },
];

const CATEGORY_FALLBACK: Record<Issue["category"], IssueAction> = {
  ux: { label: "View products", href: "/products" },
  seo: { label: "View products", href: "/products" },
  accessibility: { label: "View products", href: "/products" },
  conversion: { label: "View products", href: "/products" },
  trust: { label: "Store details", href: "/store" },
};

export function getIssueAction(
  issue: Issue,
  products: Product[] = [],
  from?: string
): IssueAction | null {
  const title = issue.title.toLowerCase();

  for (const matcher of TITLE_MATCHERS) {
    if (matcher.test(title)) {
      return matcher.resolve(issue, products, from);
    }
  }

  const quoted = extractQuotedTitle(issue.description, issue.fixSummary);
  if (quoted && products.length > 0) {
    const target = findProductByTitle(products, quoted);
    if (target) {
      return {
        label: `Edit ${target.title}`,
        href: productEditHref(target.id, from),
      };
    }
  }

  if (issue.canAutofix) {
    return null;
  }

  return CATEGORY_FALLBACK[issue.category] ?? null;
}
