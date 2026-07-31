import { Router } from "express";
import { z } from "zod";
import { NOT_LAUNCHED_ERROR } from "../lib/public-store.js";
import { db } from "../lib/db.js";

export const publicRouter = Router();

publicRouter.get("/:slug", async (req, res) => {
  try {
    const merchant = await db.merchant.findUnique({
      where: { slug: req.params.slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        branding: true,
        launchedAt: true,
        products: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            category: true,
            images: true,
            altText: true,
          },
        },
      },
    });

    if (!merchant) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    if (!merchant.launchedAt) {
      res.status(403).json(NOT_LAUNCHED_ERROR);
      return;
    }

    res.json(merchant);
  } catch (err) {
    console.error("GET /public/:slug failed:", err);
    res.status(500).json({ error: "Failed to load store" });
  }
});

publicRouter.get("/:slug/products/:productId", async (req, res) => {
  try {
    const product = await db.product.findFirst({
      where: {
        id: req.params.productId,
        merchant: { slug: req.params.slug, launchedAt: { not: null } },
      },
      include: {
        merchant: { select: { name: true, slug: true, launchedAt: true } },
        reviews: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((s, r) => s + r.rating, 0) /
          product.reviews.length
        : null;

    res.json({ ...product, avgRating });
  } catch (err) {
    console.error("GET /public product failed:", err);
    res.status(500).json({ error: "Failed to load product" });
  }
});

const checkoutSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1),
});

publicRouter.post("/:slug/checkout", async (req, res) => {
  try {
    const merchant = await db.merchant.findUnique({
      where: { slug: req.params.slug },
    });

    if (!merchant) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    if (!merchant.launchedAt) {
      res.status(403).json(NOT_LAUNCHED_ERROR);
      return;
    }

    const body = checkoutSchema.parse(req.body);

    const productIds = body.items.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { merchantId: merchant.id, id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      res.status(400).json({ error: "One or more products not found" });
      return;
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let total = 0;
    const lineItems = body.items.map((item) => {
      const product = productMap.get(item.productId)!;
      total += product.price * item.quantity;
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });

    const customer = await db.customer.upsert({
      where: {
        merchantId_email: {
          merchantId: merchant.id,
          email: body.email.toLowerCase(),
        },
      },
      create: {
        merchantId: merchant.id,
        name: body.name,
        email: body.email.toLowerCase(),
      },
      update: { name: body.name },
    });

    const order = await db.order.create({
      data: {
        merchantId: merchant.id,
        customerId: customer.id,
        total,
        status: "paid",
        items: { create: lineItems },
      },
      include: {
        items: {
          include: { product: { select: { id: true, title: true } } },
        },
        customer: { select: { name: true, email: true } },
      },
    });

    res.status(201).json(order);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0]?.message ?? "Invalid input" });
      return;
    }
    console.error("POST /public checkout failed:", err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

const reviewSchema = z.object({
  authorName: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(3).max(1000),
});

publicRouter.post("/:slug/products/:productId/reviews", async (req, res) => {
  try {
    const product = await db.product.findFirst({
      where: {
        id: req.params.productId,
        merchant: { slug: req.params.slug, launchedAt: { not: null } },
      },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const body = reviewSchema.parse(req.body);

    const review = await db.review.create({
      data: {
        productId: product.id,
        authorName: body.authorName,
        rating: body.rating,
        body: body.body,
      },
    });

    res.status(201).json(review);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0]?.message ?? "Invalid input" });
      return;
    }
    console.error("POST /public review failed:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});
