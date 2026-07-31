const RATE_LIMIT = /429|rate limit|too many requests/i;
const AI_EMPTY = /empty ai response/i;
const AI_PARSE = /invalid lens response|failed to parse|json\.parse|unexpected token/i;
const AI_TIMEOUT = /timeout|timed out|econnreset|fetch failed/i;

export function toClientError(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!(err instanceof Error)) return fallback;

  const message = err.message.trim();
  if (!message) return fallback;

  if (RATE_LIMIT.test(message)) {
    return "Simba is busy right now. Please wait a moment and try again.";
  }
  if (AI_EMPTY.test(message) || AI_PARSE.test(message)) {
    return "Simba couldn't complete that request. Please try again.";
  }
  if (AI_TIMEOUT.test(message)) {
    return "The request took too long. Please try again.";
  }

  // Avoid leaking stack traces or verbose internal errors
  if (message.length > 140 || /\n\s+at /.test(message)) {
    return fallback;
  }

  return message;
}
