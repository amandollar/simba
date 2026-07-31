import OpenAI from "openai";
import { ai, DEFAULT_MODEL } from "./ai.js";

const MAX_RETRIES = 5;
const DEFAULT_TIMEOUT_MS = 45_000;
const MAX_CONCURRENT = Math.max(
  1,
  Number(process.env.AI_MAX_CONCURRENT ?? "1")
);
const MIN_GAP_MS = Math.max(
  0,
  Number(process.env.AI_MIN_GAP_MS ?? "1200")
);

let inFlight = 0;
let lastRequestFinishedAt = 0;
const waitQueue: Array<() => void> = [];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(err: unknown): boolean {
  if (err instanceof OpenAI.APIError) {
    return err.status === 429;
  }
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes("rate") || msg.includes("429");
}

function isRetryableError(err: unknown): boolean {
  if (isRateLimitError(err)) return true;
  if (!(err instanceof Error)) return true;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("timeout") ||
    msg.includes("503") ||
    msg.includes("502") ||
    msg.includes("overloaded") ||
    msg.includes("econnreset")
  );
}

function retryDelayMs(attempt: number, err: unknown): number {
  if (err instanceof OpenAI.APIError) {
    const retryAfter = err.headers?.["retry-after"];
    if (retryAfter) {
      const seconds = Number(retryAfter);
      if (!Number.isNaN(seconds) && seconds > 0) {
        return seconds * 1000;
      }
    }
  }

  if (isRateLimitError(err)) {
    return Math.min(30_000, 2_000 * 2 ** attempt);
  }

  return 800 * (attempt + 1);
}

async function acquireAiSlot(): Promise<void> {
  if (inFlight >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => waitQueue.push(resolve));
  }

  if (MIN_GAP_MS > 0) {
    const wait = MIN_GAP_MS - (Date.now() - lastRequestFinishedAt);
    if (wait > 0) {
      await sleep(wait);
    }
  }

  inFlight++;
}

function releaseAiSlot(): void {
  inFlight = Math.max(0, inFlight - 1);
  lastRequestFinishedAt = Date.now();
  const next = waitQueue.shift();
  if (next) next();
}

async function withAiSlot<T>(fn: () => Promise<T>): Promise<T> {
  await acquireAiSlot();
  try {
    return await fn();
  } finally {
    releaseAiSlot();
  }
}

export function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("AI request timed out")), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function callChatText(options: {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  timeoutMs?: number;
}): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await withAiSlot(() =>
        withTimeout(
          ai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: options.messages,
            temperature: options.temperature ?? 0.3,
          }),
          options.timeoutMs ?? DEFAULT_TIMEOUT_MS
        )
      );

      const content = res.choices[0]?.message?.content?.trim();
      if (!content) throw new Error("Empty AI response");
      return content;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES - 1 && isRetryableError(err)) {
        await sleep(retryDelayMs(attempt, err));
        continue;
      }
      break;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("AI request failed");
}

export async function callChatJSON<T>(options: {
  messages: Array<{ role: "system" | "user"; content: string }>;
  temperature?: number;
  timeoutMs?: number;
  parse: (data: unknown) => T;
}): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await withAiSlot(() =>
        withTimeout(
          ai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: options.messages,
            response_format: { type: "json_object" },
            temperature: options.temperature ?? 0.2,
          }),
          options.timeoutMs ?? DEFAULT_TIMEOUT_MS
        )
      );

      const raw = res.choices[0]?.message?.content;
      if (!raw) throw new Error("Empty AI response");

      const parsed = JSON.parse(extractJsonObject(raw));
      return options.parse(parsed);
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES - 1 && isRetryableError(err)) {
        await sleep(retryDelayMs(attempt, err));
        continue;
      }
      break;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("AI JSON request failed");
}
