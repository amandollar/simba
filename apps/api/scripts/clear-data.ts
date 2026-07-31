import "dotenv/config";
import { db } from "../src/lib/db.js";

async function main() {
  console.log("Clearing legacy demo data...");
  await db.issue.deleteMany();
  await db.audit.deleteMany();
  await db.review.deleteMany();
  await db.order.deleteMany();
  await db.product.deleteMany();
  await db.customer.deleteMany();
  await db.merchant.deleteMany();
  console.log("Done. Run: npm run db:push -w apps/api");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
