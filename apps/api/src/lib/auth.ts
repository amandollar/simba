import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db } from "./db.js";

export type MerchantContext = {
  id: string;
  clerkUserId: string;
  name: string;
  slug: string;
};

export type AuthedRequest = Request & {
  merchant: MerchantContext;
};

/** API-friendly auth — returns 401 JSON instead of redirecting like requireAuth() */
export function requireUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  } catch (err) {
    console.error("requireUser failed:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
}

export async function attachMerchant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const merchant = await db.merchant.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        clerkUserId: true,
        name: true,
        slug: true,
      },
    });

    if (!merchant) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    (req as AuthedRequest).merchant = merchant;
    next();
  } catch (err) {
    console.error("attachMerchant failed:", err);
    res.status(500).json({ error: "Auth failed" });
  }
}
