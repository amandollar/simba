import { callChatJSON } from "../../lib/ai-call.js";
import type { IssueDraft, Lens } from "../../lib/scoring.js";
import type { StoreSnapshot } from "../../lib/store-snapshot.js";
import { lensResponseSchema } from "../core/schemas.js";
import { buildLensPrompt } from "../prompts.js";

export async function runLensAgent(
  lens: Lens,
  store: StoreSnapshot
): Promise<IssueDraft[]> {
  const prompt = buildLensPrompt(lens, store);

  try {
    const parsed = await callChatJSON({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      timeoutMs: 75_000,
      parse: (data) => {
        const result = lensResponseSchema.safeParse(data);
        if (!result.success) {
          throw new Error(`Invalid lens response: ${result.error.message}`);
        }
        return result.data.issues.map((issue) => ({
          ...issue,
          category: lens,
          fixSummary: issue.fixSummary ?? undefined,
        }));
      },
    });

    return parsed;
  } catch (err) {
    console.warn(
      `[lens-agent:${lens}] failed:`,
      err instanceof Error ? err.message : err
    );
    return [];
  }
}

export async function runAllLensAgents(
  store: StoreSnapshot
): Promise<{ lens: Lens; issues: IssueDraft[] }[]> {
  const lenses: Lens[] = [
    "ux",
    "seo",
    "accessibility",
    "conversion",
    "trust",
  ];

  const results: { lens: Lens; issues: IssueDraft[] }[] = [];

  for (const lens of lenses) {
    results.push({
      lens,
      issues: await runLensAgent(lens, store),
    });
  }

  return results;
}
