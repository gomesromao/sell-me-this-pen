import { NextResponse } from "next/server";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  persona?: any;
  business?: string;
  clients?: string;
  score?: number;
  transcript?: Array<{ q: string; chosen: string; reaction: string; points: number }>;
};

const SYSTEM = `You are the tough fictional lead the seller has been pitching to in the "Sell Me This Pen" game. The call is over. Now you step slightly out of character to give the seller one genuinely useful piece of advice, but you keep your sharp tone.

RULES
- "verdict" MUST be exactly one of: "CLOSED", "ALMOST", "LOST". Use the final score (0-100) as a guide: ≥75 closed, 45-74 almost, <45 lost.
- "headline" is a short first-person line (≤16 words) saying whether you would have bought or not, with your personality. Sharp, dry, no fluff.
- "tip" is ONE concrete and practical business or sales tip — grounded in what the seller said about their business and your pains as a lead. Up to 3 sentences. Skip clichés ("be authentic", "know your customer"). Go to the meat.
- Everything in English.
- Output JSON only, no markdown.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const persona = body.persona;
    const business = (body.business || "").slice(0, 1200);
    const clients = (body.clients || "").slice(0, 1200);
    const score = typeof body.score === "number" ? Math.max(0, Math.min(100, body.score)) : 50;
    const transcript = Array.isArray(body.transcript) ? body.transcript.slice(0, 8) : [];

    if (!persona || !business) {
      return NextResponse.json({ error: "Game data missing." }, { status: 400 });
    }

    const openai = getOpenAI();

    const userPrompt = `SELLER CONTEXT
- Business: """${business}"""
- Typical client: """${clients}"""

YOU ARE: ${persona.name}, ${persona.title} at ${persona.company}.
Pains: ${(persona.pains || []).join(" | ")}.
Mood: ${persona.mood}.

CALL TRANSCRIPT (questions you asked → option seller picked → your reaction → points awarded):
${transcript
      .map(
        (t, i) =>
          `${i + 1}. ${t.q} → seller: "${t.chosen}" (${t.points >= 0 ? "+" : ""}${t.points}) → you: "${t.reaction}"`,
      )
      .join("\n")}

FINAL SCORE: ${score}/100.

Generate JSON:
{
  "verdict": "CLOSED | ALMOST | LOST",
  "headline": "first-person short line",
  "tip": "concrete, useful tip in up to 3 sentences"
}`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    const verdicts = new Set(["CLOSED", "ALMOST", "LOST"]);
    if (!verdicts.has(parsed.verdict)) {
      parsed.verdict = score >= 75 ? "CLOSED" : score >= 45 ? "ALMOST" : "LOST";
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    const message =
      err?.status === 401
        ? "OpenAI key looks invalid. Check the environment variable."
        : err?.message || "Unknown error";
    const status = err?.status === 401 ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
