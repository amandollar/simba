import { Router } from "express";
import { askConsultant } from "../agents/consultant.js";
import { attachMerchant, requireUser } from "../lib/auth.js";
import { getMerchant } from "../lib/get-merchant.js";

export const consultantRouter = Router();

consultantRouter.use(requireUser, attachMerchant);

consultantRouter.post("/", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const { message } = req.body as { message?: string };

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "message is required" });
      return;
    }

    if (message.trim().length > 2000) {
      res.status(400).json({ error: "message is too long (max 2000 characters)" });
      return;
    }

    const result = await askConsultant(merchant.id, message);
    res.json(result);
  } catch (err) {
    console.error("POST /consultant failed:", err);
    res.status(500).json({ error: "Failed to get consultant response" });
  }
});
