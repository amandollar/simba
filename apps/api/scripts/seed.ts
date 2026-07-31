import "dotenv/config";
import { faker } from "@faker-js/faker";
import { db } from "../src/lib/db.js";

faker.seed(42);

const CATEGORIES = [
  "Footwear",
  "Apparel",
  "Camping",
  "Climbing",
  "Electronics",
  "Accessories",
  "Nutrition",
] as const;

type ProductSeed = {
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  images: string[];
  altText: string | null;
};

function img(seed: string) {
  return `https://picsum.photos/seed/${seed}/600/600`;
}

/** Well-written listings — should score well in audits */
const STRONG_PRODUCTS: ProductSeed[] = [
  {
    title: "Summit Pro Hiking Boots",
    description:
      "Waterproof full-grain leather boots with Vibram outsole and ankle support. Rated for 3-season alpine trails and long backpacking days.",
    price: 189.99,
    category: "Footwear",
    images: [img("summit-boots")],
    altText: "Brown waterproof hiking boots on a rock trail",
  },
  {
    title: "Alpine Shell Rain Jacket",
    description:
      "3-layer Gore-Tex shell with pit zips and helmet-compatible hood. Packable at 320g — built for wet mountain conditions.",
    price: 279.99,
    category: "Apparel",
    images: [img("alpine-shell")],
    altText: "Blue waterproof rain jacket folded on granite",
  },
  {
    title: "Trailblazer 65L Backpack",
    description:
      "Adjustable torso fit, load lifters, and hip belt pockets. 65L capacity for week-long treks with comfortable 35lb carry.",
    price: 219.99,
    category: "Camping",
    images: [img("trailblazer-pack")],
    altText: "Green hiking backpack with side compression straps",
  },
  {
    title: "Carbon Trekking Poles (Pair)",
    description:
      "Carbon fiber shafts with cork grips and flick-lock adjustment. Reduces knee strain on steep descents.",
    price: 89.99,
    category: "Accessories",
    images: [img("trek-poles")],
    altText: "Pair of black carbon trekking poles on a forest path",
  },
  {
    title: "Featherlite 2-Person Tent",
    description:
      "Freestanding double-wall tent with full rainfly. Sets up in under 5 minutes — ideal for backpacking couples.",
    price: 329.99,
    category: "Camping",
    images: [img("featherlite-tent")],
    altText: "Orange two-person tent pitched at a lakeside campsite",
  },
  {
    title: "Merino Base Layer Top",
    description:
      "150gsm merino wool regulates temperature and resists odor on multi-day trips. Flatlock seams for comfort under a pack.",
    price: 74.99,
    category: "Apparel",
    images: [img("merino-top")],
    altText: "Gray merino wool base layer laid flat",
  },
  {
    title: "GPS Trail Watch X3",
    description:
      "Multi-band GNSS, topo maps, and 25-day battery in expedition mode. WR100 water resistance for river crossings.",
    price: 449.99,
    category: "Electronics",
    images: [img("gps-watch")],
    altText: "Rugged outdoor GPS watch showing elevation on wrist",
  },
  {
    title: "Ultralight Sleeping Pad",
    description:
      "R-value 4.2 insulated pad at 14oz. Quiet baffles and a repair kit included — sleeps comfortably to 20°F.",
    price: 159.99,
    category: "Camping",
    images: [img("sleep-pad")],
    altText: "Inflated blue sleeping pad inside a tent",
  },
  {
    title: "Sport Climbing Harness",
    description:
      "Four gear loops, breathable mesh waist, and adjustable leg loops. CE/UIAA certified for gym and outdoor sport routes.",
    price: 79.99,
    category: "Climbing",
    images: [img("climb-harness")],
    altText: "Red climbing harness with gear loops displayed",
  },
  {
    title: "Electrolyte Hydration Mix (30 servings)",
    description:
      "Balanced sodium, potassium, and magnesium for long hikes. Lemon-lime flavor — mixes clear in any bottle.",
    price: 24.99,
    category: "Nutrition",
    images: [img("hydration-mix")],
    altText: "Tub of electrolyte powder next to a water bottle",
  },
  {
    title: "Compact Camp Stove System",
    description:
      "Integrated pot and burner boils 500ml in 2.5 minutes. Fits a 230g fuel canister inside for ultralight kits.",
    price: 64.99,
    category: "Camping",
    images: [img("camp-stove")],
    altText: "Portable camp stove boiling water in alpine setting",
  },
  {
    title: "Down Puffer Jacket",
    description:
      "800-fill responsibly sourced down with DWR shell. Packs into its own pocket — warmth without bulk at camp.",
    price: 199.99,
    category: "Apparel",
    images: [img("down-puffer")],
    altText: "Navy down jacket on a wooden hanger",
  },
  {
    title: "Dry Bag Trio (5L / 10L / 20L)",
    description:
      "Roll-top waterproof bags for electronics, clothes, and food. Bright colors for easy camp organization.",
    price: 34.99,
    category: "Accessories",
    images: [img("dry-bags")],
    altText: "Three colorful roll-top dry bags stacked",
  },
  {
    title: "Trail Running Shoes — Wide",
    description:
      "Aggressive lug outsole and rock plate for technical terrain. Wide toe box for all-day comfort on ultras.",
    price: 134.99,
    category: "Footwear",
    images: [img("trail-run-wide")],
    altText: "Trail running shoes with aggressive tread on dirt",
  },
  {
    title: "Headlamp 600 Lumen Pro",
    description:
      "Rechargeable USB-C headlamp with red night mode and tilt adjustment. 60-hour runtime on low for hut-to-hut hikes.",
    price: 49.99,
    category: "Electronics",
    images: [img("headlamp-pro")],
    altText: "LED headlamp shining on a trail at dusk",
  },
];

/** Intentional catalog flaws for AI agents to detect */
const FLAWED_PRODUCTS: ProductSeed[] = [
  {
    title: "Product Name",
    description: "Premium hiking boots with waterproof leather upper.",
    price: 129.99,
    category: "Footwear",
    images: [img("flaw-boots-1")],
    altText: null,
  },
  {
    title: "Product Name",
    description: "Lightweight trail shoes for all terrains.",
    price: 99.99,
    category: "Footwear",
    images: [img("flaw-shoes-1")],
    altText: null,
  },
  {
    title: "Camping Lantern LED",
    description: "",
    price: 34.99,
    category: "Camping",
    images: [img("flaw-lantern")],
    altText: "lantern",
  },
  {
    title: "Portable Stove",
    description: "",
    price: 45.99,
    category: null,
    images: [img("flaw-stove")],
    altText: null,
  },
  {
    title: "Trekking Poles Set",
    description: null,
    price: 59.99,
    category: null,
    images: [],
    altText: null,
  },
  {
    title: "Water Filter Bottle",
    description:
      "Great water bottle. Best water bottle. Amazing water bottle for hiking.",
    price: 29.99,
    category: "Accessories",
    images: [img("flaw-bottle")],
    altText: null,
  },
  {
    title: "Outdoor Jacket",
    description:
      "Great outdoor jacket. Best outdoor jacket. Amazing outdoor jacket for hiking.",
    price: 149.99,
    category: "Apparel",
    images: [img("flaw-jacket")],
    altText: null,
  },
  {
    title: "Climbing Chalk Bag",
    description: "Chalk bag.",
    price: 19.99,
    category: null,
    images: [img("flaw-chalk")],
    altText: null,
  },
  {
    title: "Camping Chair Foldable",
    description: null,
    price: 49.99,
    category: null,
    images: [],
    altText: null,
  },
  {
    title: "Emergency Whistle",
    description: "Whistle for safety.",
    price: 8.99,
    category: null,
    images: [img("flaw-whistle")],
    altText: "img",
  },
];

function generateCatalogProducts(count: number): ProductSeed[] {
  const adjectives = ["Trail", "Summit", "Alpine", "Ridge", "Canyon", "Pine", "Granite"];
  const nouns = ["Gloves", "Socks", "Hat", "Belt", "Sack", "Kit", "Tool", "Wrap", "Strap"];
  const products: ProductSeed[] = [];

  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement([...CATEGORIES]);
    const title = `${faker.helpers.arrayElement(adjectives)} ${faker.helpers.arrayElement(nouns)} ${i + 1}`;
    const hasImage = faker.number.float() > 0.08;
    const hasAlt = hasImage && faker.number.float() > 0.25;
    const hasCategory = faker.number.float() > 0.12;
    const hasGoodDesc = faker.number.float() > 0.2;

    products.push({
      title,
      description: hasGoodDesc
        ? faker.commerce.productDescription()
        : faker.number.float() > 0.5
          ? faker.lorem.sentence()
          : null,
      price: faker.number.float({ min: 12, max: 320, fractionDigits: 2 }),
      category: hasCategory ? category : null,
      images: hasImage ? [img(`gen-${i}-${title.replace(/\s/g, "-").toLowerCase()}`)] : [],
      altText: hasAlt ? faker.commerce.productAdjective() + " " + title.toLowerCase() : null,
    });
  }

  return products;
}

function parseArgs() {
  const slugArg = process.argv.find((a) => a.startsWith("--slug="));
  const idArg = process.argv.find((a) => a.startsWith("--id="));
  return {
    slug: slugArg?.split("=")[1] ?? process.env.SEED_MERCHANT_SLUG,
    merchantId: idArg?.split("=")[1] ?? process.env.SEED_MERCHANT_ID,
  };
}

async function clearMerchantData(merchantId: string) {
  await db.fixApplication.deleteMany({ where: { merchantId } });
  await db.issue.deleteMany({ where: { audit: { merchantId } } });
  await db.audit.deleteMany({ where: { merchantId } });
  await db.review.deleteMany({ where: { product: { merchantId } } });
  await db.orderItem.deleteMany({ where: { order: { merchantId } } });
  await db.order.deleteMany({ where: { merchantId } });
  await db.product.deleteMany({ where: { merchantId } });
  await db.customer.deleteMany({ where: { merchantId } });
}

async function main() {
  const { slug, merchantId } = parseArgs();

  let merchant = merchantId
    ? await db.merchant.findUnique({ where: { id: merchantId } })
    : slug
      ? await db.merchant.findUnique({ where: { slug } })
      : await db.merchant.findFirst({ orderBy: { createdAt: "desc" } });

  if (!merchant) {
    console.error(
      "\nNo merchant found. Create a store in the app first, then run:\n" +
        "  npm run seed -- --slug=your-store-slug\n" +
        "  npm run seed -- --id=<merchant-cuid>\n" +
        "Or set SEED_MERCHANT_SLUG in apps/api/.env\n"
    );
    process.exit(1);
  }

  console.log(`\nSeeding merchant: ${merchant.name} (${merchant.slug})`);
  console.log("Clearing existing catalog, orders, reviews, audits...\n");
  await clearMerchantData(merchant.id);

  const existingBranding =
    merchant.branding && typeof merchant.branding === "object"
      ? (merchant.branding as Record<string, unknown>)
      : {};

  await db.merchant.update({
    where: { id: merchant.id },
    data: {
      description:
        merchant.description?.trim() ||
        "Premium outdoor gear for hikers, climbers, and weekend explorers. Curated equipment tested on real trails — from ultralight packs to technical footwear.",
      launchedAt: merchant.launchedAt ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      branding: {
        ...existingBranding,
        tagline:
          (existingBranding.tagline as string) || "Gear up for every adventure",
        accentColor: (existingBranding.accentColor as string) || "#4338ca",
        backgroundImageUrl:
          (existingBranding.backgroundImageUrl as string) ||
          img("store-hero-banner"),
      },
    },
  });

  const catalog = [
    ...STRONG_PRODUCTS,
    ...FLAWED_PRODUCTS,
    ...generateCatalogProducts(23),
  ];

  console.log(`Creating ${catalog.length} products...`);
  const products = [];
  for (const p of catalog) {
    products.push(
      await db.product.create({
        data: {
          merchantId: merchant.id,
          title: p.title,
          description: p.description,
          price: p.price,
          category: p.category,
          images: p.images,
          altText: p.altText,
          createdAt: faker.date.past({ years: 1 }),
        },
      })
    );
  }

  console.log("Creating customers...");
  const customers = [];
  for (let i = 0; i < 32; i++) {
    customers.push(
      await db.customer.create({
        data: {
          merchantId: merchant.id,
          name: faker.person.fullName(),
          email: `customer${i + 1}.${faker.string.alphanumeric(6).toLowerCase()}@example.com`,
        },
      })
    );
  }

  const bestsellers = products.filter((p) =>
    STRONG_PRODUCTS.some((s) => s.title === p.title)
  );
  const orderPool = bestsellers.length > 0 ? bestsellers : products.slice(0, 12);

  console.log("Creating orders with line items...");
  let orderCount = 0;
  let itemCount = 0;

  for (let i = 0; i < 58; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const lineCount = faker.number.int({ min: 1, max: 4 });
    const lineProducts = faker.helpers.arrayElements(orderPool, lineCount);
    const items = lineProducts.map((product) => {
      const quantity = faker.number.int({ min: 1, max: 3 });
      return { product, quantity, unitPrice: product.price };
    });
    const total = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);

    await db.order.create({
      data: {
        merchantId: merchant.id,
        customerId: customer.id,
        total: Math.round(total * 100) / 100,
        status: faker.helpers.arrayElement(["paid", "paid", "paid", "refunded"]),
        createdAt: faker.date.past({ years: 1 }),
        items: {
          create: items.map((it) => ({
            productId: it.product.id,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
        },
      },
    });
    orderCount++;
    itemCount += items.length;
  }

  console.log("Creating reviews...");
  const reviewTemplates = [
    "Exactly what I needed for my week on the JMT. Fits perfectly and held up in rain.",
    "Fast shipping and great quality. Will order again before my next trip.",
    "Solid gear for the price. Took one star off because sizing ran slightly small.",
    "Used this on a 3-day backpacking trip — performed flawlessly.",
    "Good product but the color was slightly different from the photos.",
    "Best purchase I've made for trail running this season.",
    "Comfortable and lightweight. My go-to for shoulder-season hikes.",
    "Arrived quickly. Packaging was minimal and eco-friendly — appreciated.",
    "Not bad, but instructions could be clearer for first-time setup.",
    "Five stars. My climbing partner bought one after seeing mine.",
    "Decent value. Would recommend for beginners getting into camping.",
    "Held up great in wet conditions on the Olympic coast.",
  ];

  let reviewCount = 0;
  const reviewedProducts = faker.helpers.arrayElements(products, 28);

  for (const product of reviewedProducts) {
    const n = faker.number.int({ min: 2, max: 7 });
    for (let r = 0; r < n; r++) {
      await db.review.create({
        data: {
          productId: product.id,
          authorName: faker.person.firstName(),
          rating: faker.helpers.weightedArrayElement([
            { weight: 5, value: 5 },
            { weight: 4, value: 4 },
            { weight: 3, value: 4 },
            { weight: 2, value: 3 },
            { weight: 1, value: 2 },
          ]),
          body: faker.helpers.arrayElement(reviewTemplates),
          createdAt: faker.date.past({ years: 1 }),
        },
      });
      reviewCount++;
    }
  }

  const flaws = {
    placeholderTitles: products.filter((p) => p.title === "Product Name").length,
    noImages: products.filter((p) => p.images.length === 0).length,
    noCategory: products.filter((p) => !p.category?.trim()).length,
    noAlt: products.filter((p) => p.images.length > 0 && !p.altText?.trim()).length,
    weakDesc: products.filter((p) => !p.description || p.description.length < 40).length,
  };

  console.log("\n--- Seed complete ---");
  console.log(`Store:     ${merchant.name} (/${merchant.slug})`);
  console.log(`Products:  ${products.length}`);
  console.log(`Customers: ${customers.length}`);
  console.log(`Orders:    ${orderCount} (${itemCount} line items)`);
  console.log(`Reviews:   ${reviewCount}`);
  console.log("\nIntentional flaws for AI testing:");
  console.log(`  Placeholder titles: ${flaws.placeholderTitles}`);
  console.log(`  Missing images:     ${flaws.noImages}`);
  console.log(`  Missing category:   ${flaws.noCategory}`);
  console.log(`  Missing alt text:   ${flaws.noAlt}`);
  console.log(`  Weak descriptions:  ${flaws.weakDesc}`);
  console.log("\nNext: open Simba Overview and run a scan to see agents in action.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
