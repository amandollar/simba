import { Router } from "express";
import { generateFix } from "../agents/fix.js";
import { attachMerchant, requireUser } from "../lib/auth.js";
import { getMerchant } from "../lib/get-merchant.js";
import { db } from "../lib/db.js";
import { toClientError } from "../lib/client-error.js";

export const issuesRouter = Router();

issuesRouter.use(requireUser, attachMerchant);

issuesRouter.get("/", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const status = req.query.status as string | undefined;

    const latestAudit = await db.audit.findFirst({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (!latestAudit) {
      res.json([]);
      return;
    }

    const issues = await db.issue.findMany({
      where: {
        auditId: latestAudit.id,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(issues);
  } catch (err) {
    console.error("GET /issues failed:", err);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
});

issuesRouter.patch("/:id", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const { status } = req.body as { status?: string };
    if (!status || !["open", "resolved", "dismissed"].includes(status)) {
      res.status(400).json({
        error: 'status must be "open", "resolved", or "dismissed"',
      });
      return;
    }

    const issue = await db.issue.findFirst({
      where: {
        id: req.params.id,
        audit: { merchantId: merchant.id },
      },
    });
    if (!issue) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }

    const updated = await db.issue.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(updated);
  } catch (err) {
    console.error("PATCH /issues/:id failed:", err);
    res.status(500).json({ error: "Failed to update issue" });
  }
});

issuesRouter.post("/:id/fix", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const apply = req.body?.apply === true;
    const productId =
      typeof req.body?.productId === "string" ? req.body.productId : undefined;
    const changes =
      req.body?.changes &&
      typeof req.body.changes === "object" &&
      typeof req.body.changes.productId === "string"
        ? (req.body.changes as {
            productId: string;
            title?: string;
            description?: string;
            altText?: string;
            category?: string;
          })
        : undefined;

    const issue = await db.issue.findFirst({
      where: {
        id: req.params.id,
        audit: { merchantId: merchant.id },
      },
    });
    if (!issue) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }

    const result = await generateFix(req.params.id, apply, productId, changes);
    res.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate fix";
    const clientError =
      message.includes("Pick a product") ||
      message.includes("invalid") ||
      message.includes("does not match") ||
      message.includes("not found");
    console.error("POST /issues/:id/fix failed:", err);
    res.status(clientError ? 400 : 500).json({
      error: clientError
        ? message
        : toClientError(err, "Failed to generate fix. Please try again."),
    });
  }
});
