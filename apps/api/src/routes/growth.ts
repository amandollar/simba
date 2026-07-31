import { Router } from "express";
import { generateGrowthPlan } from "../agents/growth.js";
import { attachMerchant, requireUser } from "../lib/auth.js";
import { getMerchant } from "../lib/get-merchant.js";
import { toClientError } from "../lib/client-error.js";
import {
  getGrowthPlanById,
  getLatestGrowthPlan,
  listGrowthPlanHistory,
  toggleGrowthActionComplete,
} from "../lib/growth-plans.js";

export const growthRouter = Router();

growthRouter.use(requireUser, attachMerchant);

growthRouter.get("/plan", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const plan = await getLatestGrowthPlan(merchant.id);
    res.json(plan);
  } catch (err) {
    console.error("GET /growth/plan failed:", err);
    res.status(500).json({ error: "Failed to fetch growth plan" });
  }
});

growthRouter.get("/plans", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const plans = await listGrowthPlanHistory(merchant.id);
    res.json(plans);
  } catch (err) {
    console.error("GET /growth/plans failed:", err);
    res.status(500).json({ error: "Failed to fetch growth plan history" });
  }
});

growthRouter.get("/plans/:id", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const plan = await getGrowthPlanById(merchant.id, req.params.id);
    if (!plan) {
      res.status(404).json({ error: "Growth plan not found" });
      return;
    }
    res.json(plan);
  } catch (err) {
    console.error("GET /growth/plans/:id failed:", err);
    res.status(500).json({ error: "Failed to fetch growth plan" });
  }
});

growthRouter.post("/plan", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const plan = await generateGrowthPlan(merchant.id);
    res.json(plan);
  } catch (err) {
    console.error("POST /growth/plan failed:", err);
    res.status(500).json({
      error: toClientError(err, "Failed to generate growth plan. Please try again."),
    });
  }
});

growthRouter.patch("/plans/:planId/actions/:actionId", async (req, res) => {
  try {
    const merchant = getMerchant(req);
    const plan = await toggleGrowthActionComplete(
      merchant.id,
      req.params.planId,
      req.params.actionId
    );
    if (!plan) {
      res.status(404).json({ error: "Growth plan not found" });
      return;
    }
    res.json(plan);
  } catch (err) {
    console.error("PATCH /growth/plans/:planId/actions/:actionId failed:", err);
    res.status(500).json({ error: "Failed to update action" });
  }
});
