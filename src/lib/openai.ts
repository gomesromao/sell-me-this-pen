import OpenAI from "openai";

let cached: OpenAI | null = null;

export function getOpenAI() {
  if (cached) return cached;
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing on the server. Set it in Vercel → Project → Settings → Environment Variables and redeploy.",
    );
  }
  cached = new OpenAI({ apiKey });
  return cached;
}

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
