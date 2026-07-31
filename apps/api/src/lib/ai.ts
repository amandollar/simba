import OpenAI from "openai";

/**
 * Groq exposes an OpenAI-compatible API.
 * Set GROQ_API_KEY in .env (or override with AI_API_KEY / AI_BASE_URL / AI_MODEL).
 */
export const ai = new OpenAI({
  apiKey:
    process.env.AI_API_KEY ??
    process.env.GROQ_API_KEY ??
    process.env.GEMINI_API_KEY,
  baseURL:
    process.env.AI_BASE_URL ?? "https://api.groq.com/openai/v1",
});

export const DEFAULT_MODEL =
  process.env.AI_MODEL ?? "llama-3.3-70b-versatile";
