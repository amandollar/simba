import "dotenv/config";
import { db } from "../src/lib/db.js";

async function main() {
  const [fixes, audits] = await Promise.all([
    db.fixApplication.deleteMany(),
    db.audit.deleteMany(),
  ]);

  console.log("Audit history reset.");
  console.log(`  audits removed: ${audits.count}`);
  console.log(`  fix history removed: ${fixes.count}`);
  console.log("Products, orders, customers, and store settings were not changed.");
}

main()
  .catch((err) => {
    console.error("Reset failed:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
