import { Router } from "express";
import { getAuth } from "@clerk/express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { attachMerchant, requireUser } from "../lib/auth.js";
import type { AuthedRequest } from "../lib/auth.js";
import { scheduleAuditRescan } from "../lib/audit-rescan.js";
import { computeLaunchReadiness } from "../lib/launch-readiness.js";
import { db } from "../lib/db.js";

export const merchantRouter = Router();

merchantRouter.use(requireUser);

merchantRouter.get("/me", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const merchant = await db.merchant.findUnique({
      where: { clerkUserId: userId },
    });

    res.json(merchant);
  } catch (err) {
    console.error("GET /merchant/me failed:", err);
    res.status(500).json({ error: "Failed to fetch store" });
  }
});

const slugSchema = z
  .string()
  .min(3)
  .max(50)
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens");

const createSchema = z.object({
  name: z.string().min(2).max(75),
  slug: slugSchema,
  description: z.string().max(500).optional(),
});

merchantRouter.post("/", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const existing = await db.merchant.findUnique({
      where: { clerkUserId: userId },
    });
    if (existing) {
      res.status(409).json({ error: "Store already exists" });
      return;
    }

    const body = createSchema.parse(req.body);

    const slugTaken = await db.merchant.findUnique({
      where: { slug: body.slug },
    });
    if (slugTaken) {
      res.status(409).json({ error: "This store URL is already taken" });
      return;
    }

    const merchant = await db.merchant.create({
      data: {
        clerkUserId: userId,
        name: body.name,
        slug: body.slug,
        description: body.description,
      },
    });

    res.status(201).json(merchant);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0]?.message ?? "Invalid input" });
      return;
    }
    console.error("POST /merchant failed:", err);
    res.status(500).json({ error: "Failed to create store" });
  }
});

const brandingSchema = z.object({
  logoUrl: z.string().url().nullable().optional(),
  backgroundImageUrl: z.string().url().nullable().optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Accent color must be a hex value like #171717")
    .nullable()
    .optional(),
  tagline: z.string().max(120).nullable().optional(),
});

const updateSchema = z.object({
  name: z.string().min(2).max(75).optional(),
  slug: slugSchema.optional(),
  description: z.string().max(500).optional().nullable(),
  branding: brandingSchema.optional(),
});

merchantRouter.patch("/", attachMerchant, async (req, res) => {
  try {
    const body = updateSchema.parse(req.body);
    const merchant = (req as AuthedRequest).merchant;

    const existing = await db.merchant.findUniqueOrThrow({
      where: { id: merchant.id },
      select: { branding: true },
    });

    const existingBranding =
      existing.branding && typeof existing.branding === "object"
        ? (existing.branding as Record<string, unknown>)
        : {};

    const data: {
      name?: string;
      slug?: string;
      description?: string | null;
      branding?: Prisma.InputJsonValue;
    } = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.branding !== undefined) {
      data.branding = { ...existingBranding, ...body.branding } as Prisma.InputJsonValue;
    }

    if (body.slug !== undefined) {
      const nextSlug = body.slug.trim().toLowerCase();
      if (nextSlug !== merchant.slug) {
        const slugTaken = await db.merchant.findFirst({
          where: {
            slug: nextSlug,
            id: { not: merchant.id },
          },
        });
        if (slugTaken) {
          res.status(409).json({ error: "This store URL is already taken" });
          return;
        }
        data.slug = nextSlug;
      }
    }

    const updated = await db.merchant.update({
      where: { id: merchant.id },
      data,
    });

    scheduleAuditRescan(merchant.id, "store-details-updated");
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0]?.message ?? "Invalid input" });
      return;
    }
    console.error("PATCH /merchant failed:", err);
    res.status(500).json({ error: "Failed to update store" });
  }
});

merchantRouter.get("/launch-readiness", attachMerchant, async (req, res) => {
  try {
    const merchant = (req as AuthedRequest).merchant;
    const readiness = await computeLaunchReadiness(merchant.id);
    res.json(readiness);
  } catch (err) {
    console.error("GET /merchant/launch-readiness failed:", err);
    res.status(500).json({ error: "Failed to check launch readiness" });
  }
});

merchantRouter.post("/launch", attachMerchant, async (req, res) => {
  try {
    const merchant = (req as AuthedRequest).merchant;

    const readiness = await computeLaunchReadiness(merchant.id);
    if (!readiness.ready) {
      const firstBlocker = readiness.items.find((i) => !i.passed);
      res.status(400).json({
        error: firstBlocker?.hint ?? "Complete the launch checklist first",
        readiness,
      });
      return;
    }

    const updated = await db.merchant.update({
      where: { id: merchant.id },
      data: { launchedAt: new Date() },
    });

    scheduleAuditRescan(merchant.id, "store-launched", "priority");
    res.json(updated);
  } catch (err) {
    console.error("POST /merchant/launch failed:", err);
    res.status(500).json({ error: "Failed to launch store" });
  }
});
