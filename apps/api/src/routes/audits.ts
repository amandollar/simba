import { Router } from "express";
import { runFullAudit } from "../agents/analyze.js";
import { attachMerchant, requireUser } from "../lib/auth.js";
import { getAuditRescanStatus } from "../lib/audit-rescan.js";
import { serializeFixProof } from "../lib/audit-diff.js";
import { getMerchant } from "../lib/get-merchant.js";
import { getAuditDiff, getAuditHistoryWithSummaries } from "../lib/get-audit-diff.js";
import { db } from "../lib/db.js";

export const auditsRouter = Router();

auditsRouter.use(requireUser, attachMerchant);

auditsRouter.post("/", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const audit = await runFullAudit(merchant.id);
    const diff = await getAuditDiff(merchant.id, audit.id);
    res.status(201).json({ ...audit, diff });
  } catch (err) {
    console.error("POST /audits failed:", err);
    res.status(500).json({ error: "Failed to run audit" });
  }
});

auditsRouter.get("/rescan-status", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    res.json(getAuditRescanStatus(merchant.id));
  } catch (err) {
    console.error("GET /audits/rescan-status failed:", err);
    res.status(500).json({ error: "Failed to fetch rescan status" });
  }
});

auditsRouter.get("/diff", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const diff = await getAuditDiff(merchant.id);
    if (!diff) {
      res.json(null);
      return;
    }
    res.json(diff);
  } catch (err) {
    console.error("GET /audits/diff failed:", err);
    res.status(500).json({ error: "Failed to compute audit diff" });
  }
});

auditsRouter.get("/:id/diff", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const diff = await getAuditDiff(merchant.id, req.params.id);
    if (!diff) {
      res.status(404).json({ error: "Audit not found" });
      return;
    }
    res.json(diff);
  } catch (err) {
    console.error("GET /audits/:id/diff failed:", err);
    res.status(500).json({ error: "Failed to compute audit diff" });
  }
});

auditsRouter.get("/", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const all = req.query.all === "true";

    if (all) {
      const audits = await getAuditHistoryWithSummaries(merchant.id);
      res.json(audits);
      return;
    }

    const audit = await db.audit.findFirst({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
      include: {
        issues: { orderBy: { createdAt: "desc" } },
      },
    });

    res.json(audit);
  } catch (err) {
    console.error("GET /audits failed:", err);
    res.status(500).json({ error: "Failed to fetch audits" });
  }
});

export const fixesRouter = Router();

fixesRouter.use(requireUser, attachMerchant);

fixesRouter.get("/", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const fixes = await db.fixApplication.findMany({
      where: { merchantId: merchant.id },
      orderBy: { appliedAt: "desc" },
      take: limit,
    });

    res.json(fixes.map(serializeFixProof));
  } catch (err) {
    console.error("GET /fixes failed:", err);
    res.status(500).json({ error: "Failed to fetch fixes" });
  }
});
