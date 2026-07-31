import { Router } from "express";
import { z } from "zod";
import { optimizeProductCopy } from "../agents/copy.js";
import { attachMerchant, requireUser } from "../lib/auth.js";
import { scheduleAuditRescan } from "../lib/audit-rescan.js";
import {
  createUploadSignature,
  isCloudinaryConfigured,
} from "../lib/cloudinary.js";
import { getMerchant } from "../lib/get-merchant.js";
import { db } from "../lib/db.js";
import { computeStoreAnalytics } from "../lib/store-analytics.js";

export const storeRouter = Router();

storeRouter.use(requireUser, attachMerchant);

storeRouter.post("/uploads/sign", async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      res.status(503).json({ error: "Image uploads are not configured" });
      return;
    }

    const purpose = z
      .enum(["products", "branding"])
      .parse(req.body?.purpose ?? "products");

    const merchant = getMerchant(req);
    const signature = createUploadSignature(merchant.id, purpose);
    res.json(signature);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid upload purpose" });
      return;
    }
    console.error("POST /store/uploads/sign failed:", err);
    res.status(500).json({ error: "Failed to prepare upload" });
  }
});

storeRouter.get("/products", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const products = await db.product.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (err) {
    console.error("GET /store/products failed:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

const productSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  price: z.number().positive(),
  category: z.string().max(50).optional(),
  images: z.array(z.string().url()).max(5).default([]),
  altText: z.string().max(200).optional(),
});

storeRouter.post("/products", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const body = productSchema.parse(req.body);

    const product = await db.product.create({
      data: { merchantId: merchant.id, ...body },
    });

    scheduleAuditRescan(merchant.id, "product-created");
    res.status(201).json(product);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0]?.message ?? "Invalid input" });
      return;
    }
    console.error("POST /store/products failed:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

storeRouter.patch("/products/:id", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const body = productSchema.partial().parse(req.body);

    const existing = await db.product.findFirst({
      where: { id: req.params.id, merchantId: merchant.id },
    });
    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const product = await db.product.update({
      where: { id: req.params.id },
      data: body,
    });

    scheduleAuditRescan(merchant.id, "product-updated");
    res.json(product);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0]?.message ?? "Invalid input" });
      return;
    }
    console.error("PATCH /store/products/:id failed:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

const copyChangesSchema = z.object({
  productId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  altText: z.string().optional(),
  category: z.string().optional(),
});

storeRouter.post("/products/:id/optimize-copy", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const apply = req.body?.apply === true;
    const changes = req.body?.changes
      ? copyChangesSchema.parse(req.body.changes)
      : undefined;

    const result = await optimizeProductCopy(merchant.id, req.params.id, {
      apply,
      changes,
    });

    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0]?.message ?? "Invalid input" });
      return;
    }
    console.error("POST /store/products/:id/optimize-copy failed:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to optimize copy",
    });
  }
});

storeRouter.delete("/products/:id", async (req, res) => {
  try {
    const merchant = getMerchant(req);

    const existing = await db.product.findFirst({
      where: { id: req.params.id, merchantId: merchant.id },
    });
    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    await db.product.delete({ where: { id: req.params.id } });
    scheduleAuditRescan(merchant.id, "product-deleted");
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /store/products/:id failed:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

storeRouter.get("/orders", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const orders = await db.order.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true } },
        items: {
          include: { product: { select: { id: true, title: true } } },
        },
      },
    });
    res.json(orders);
  } catch (err) {
    console.error("GET /store/orders failed:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

storeRouter.get("/orders/:id", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const order = await db.order.findFirst({
      where: { id: req.params.id, merchantId: merchant.id },
      include: {
        customer: { select: { name: true, email: true } },
        items: {
          include: {
            product: {
              select: { id: true, title: true, images: true, category: true },
            },
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(order);
  } catch (err) {
    console.error("GET /store/orders/:id failed:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

storeRouter.get("/customers", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const customers = await db.customer.findMany({
      where: { merchantId: merchant.id },
      orderBy: { name: "asc" },
      include: {
        orders: {
          select: { total: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.json(
      customers.map((customer) => ({
        id: customer.id,
        merchantId: customer.merchantId,
        name: customer.name,
        email: customer.email,
        orderCount: customer.orders.length,
        totalSpent: customer.orders.reduce((sum, o) => sum + o.total, 0),
        lastOrderAt: customer.orders[0]?.createdAt ?? null,
      }))
    );
  } catch (err) {
    console.error("GET /store/customers failed:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

storeRouter.get("/analytics", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const analytics = await computeStoreAnalytics(merchant.id);
    res.json(analytics);
  } catch (err) {
    console.error("GET /store/analytics failed:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

storeRouter.get("/categories", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const products = await db.product.findMany({
      where: { merchantId: merchant.id, category: { not: null } },
      select: { category: true },
    });

    const categories = [
      ...new Set(
        products
          .map((p) => p.category?.trim())
          .filter((c): c is string => Boolean(c))
      ),
    ].sort();

    res.json(categories);
  } catch (err) {
    console.error("GET /store/categories failed:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

storeRouter.get("/reviews", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const reviews = await db.review.findMany({
      where: { product: { merchantId: merchant.id } },
      include: { product: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(reviews);
  } catch (err) {
    console.error("GET /store/reviews failed:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});
