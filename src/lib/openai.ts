import OpenAI from "openai";

let cached: OpenAI | null = null;

export function getOpenAI() {
  if (cached) return cached;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY não configurada");
  cached = new OpenAI({ apiKey });
  return cached;
}

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
