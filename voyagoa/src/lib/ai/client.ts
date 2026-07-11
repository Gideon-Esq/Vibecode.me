import "server-only";
import OpenAI from "openai";

export const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

let client: OpenAI | null = null;

/**
 * "live"  -> real OpenAI API calls
 * "demo"  -> deterministic sample plans (no OPENAI_API_KEY configured, or
 *            VOYAGOA_DEMO_MODE=1). The UI surfaces this clearly.
 */
export function aiMode(): "live" | "demo" {
  if (process.env.VOYAGOA_DEMO_MODE === "1") return "demo";
  return process.env.OPENAI_API_KEY ? "live" : "demo";
}

export function getOpenAI(): OpenAI {
  if (!client) client = new OpenAI(); // reads OPENAI_API_KEY from env
  return client;
}

/** Maps OpenAI API failures to a user-facing message, or null for unknown errors. */
export function describeAiError(err: unknown): string | null {
  if (err instanceof OpenAI.APIError) {
    if (err.code === "insufficient_quota") {
      return "Your OpenAI account is out of quota — check plan and billing at platform.openai.com.";
    }
    if (err.status === 401) {
      return "The OpenAI API key was rejected — check OPENAI_API_KEY in .env.";
    }
    if (err.status === 404 && /model/i.test(err.message)) {
      return "The configured OPENAI_MODEL was not found — check the model name in .env.";
    }
    if (err.status === 429) {
      return "OpenAI rate limit reached — try again in a moment.";
    }
  }
  return null;
}
