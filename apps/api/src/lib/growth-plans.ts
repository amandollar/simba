import type { Prisma } from "@prisma/client";
import { db } from "./db.js";
import type { GrowthPlan, StoredGrowthPlan } from "../agents/core/types.js";

export interface GrowthPlanSummary {
  id: string;
  headline: string;
  stageLabel: string;
  generatedAt: string;
  completedCount: number;
  actionCount: number;
}

function serializeStored(record: {
  id: string;
  plan: Prisma.JsonValue;
  completedActionIds: string[];
  createdAt: Date;
}): StoredGrowthPlan {
  const plan = record.plan as unknown as GrowthPlan;
  return {
    ...plan,
    id: record.id,
    completedActionIds: record.completedActionIds,
    generatedAt: plan.generatedAt ?? record.createdAt.toISOString(),
  };
}

export async function saveGrowthPlan(
  merchantId: string,
  plan: GrowthPlan
): Promise<StoredGrowthPlan> {
  const record = await db.growthPlanRecord.create({
    data: {
      merchantId,
      plan: plan as unknown as Prisma.InputJsonValue,
      completedActionIds: [],
    },
  });

  return serializeStored(record);
}

export async function getLatestGrowthPlan(
  merchantId: string
): Promise<StoredGrowthPlan | null> {
  const record = await db.growthPlanRecord.findFirst({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
  });

  return record ? serializeStored(record) : null;
}

export async function listGrowthPlanHistory(
  merchantId: string,
  limit = 8
): Promise<GrowthPlanSummary[]> {
  const records = await db.growthPlanRecord.findMany({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      plan: true,
      completedActionIds: true,
      createdAt: true,
    },
  });

  return records.map((record) => {
    const plan = record.plan as unknown as GrowthPlan;
    return {
      id: record.id,
      headline: plan.headline,
      stageLabel: plan.stageLabel,
      generatedAt: plan.generatedAt ?? record.createdAt.toISOString(),
      completedCount: record.completedActionIds.length,
      actionCount: plan.actions.length,
    };
  });
}

export async function getGrowthPlanById(
  merchantId: string,
  planId: string
): Promise<StoredGrowthPlan | null> {
  const record = await db.growthPlanRecord.findFirst({
    where: { id: planId, merchantId },
  });

  return record ? serializeStored(record) : null;
}

export async function toggleGrowthActionComplete(
  merchantId: string,
  planId: string,
  actionId: string
): Promise<StoredGrowthPlan | null> {
  const record = await db.growthPlanRecord.findFirst({
    where: { id: planId, merchantId },
  });

  if (!record) return null;

  const completed = new Set(record.completedActionIds);
  if (completed.has(actionId)) {
    completed.delete(actionId);
  } else {
    completed.add(actionId);
  }

  const updated = await db.growthPlanRecord.update({
    where: { id: planId },
    data: { completedActionIds: [...completed] },
  });

  return serializeStored(updated);
}
