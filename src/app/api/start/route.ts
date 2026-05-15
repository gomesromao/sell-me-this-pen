import { NextResponse } from "next/server";
import { CHARACTERS, type CharacterArchetype } from "@/lib/characters";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  clients?: string;
  business?: string;
};

function pickArchetypeShortlist(count: number): CharacterArchetype[] {
  const pool = [...CHARACTERS];
  const out: CharacterArchetype[] = [];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

const SYSTEM_BASE = `You are the director of a sales-training game called "Sell Me This Pen", inspired by the famous scene from The Wolf of Wall Street.

Your job: generate one tough, fictional LEAD plus 5 multiple-choice questions (A/B/C) the lead will throw at the seller during a discovery call.

PERSONA RULES
- The lead is coherent with the seller's business and ideal client, but has their own personality, name, title and (made-up) company.
- You will receive a SHORTLIST of 4-5 archetypes for THIS run. Pick the one whose personality would most realistically be the actual buyer for the seller's product. Do NOT default to "burned_out_founder" or any other archetype out of habit — match the buyer profile to the seller's market and price point.
- The persona's name, title and company must fit the chosen archetype and the seller's market. Invent fresh names. Do not reuse the example names from the archetype list.

QUESTION RULES — READ CAREFULLY
- The lead is skeptical, busy, sharp. Tough but professional — never goofy, never cartoonish.
- Each question MUST reference something concrete from the seller's actual pitch: a specific deliverable, a price model, a methodology, a channel, a timeframe, a guarantee, a metric, a tool they mentioned. If the seller mentions "30-day sprint", at least one question must press on the 30 days. If they say "refund guarantee", question the conditions. If they say "Google Maps", ask about it specifically.
- BANNED: generic questions like "How do you guarantee ROI?", "What makes you different?", "Why should I trust you?". Replace with sharper variants that include the seller's specifics, e.g. "If your 30-day sprint doesn't hit 20 leads, what exactly do you refund — fees, ad spend, or both?".
- Mix the angles across the 5 questions: pricing/commercial, methodology/process, risk/guarantee, switching cost/integration, proof/case study, edge case. Don't repeat the same angle twice.
- Each question has 3 options (A, B, C). Each option scores -20 to +20.
- Every question MUST contain one weak answer (negative points), one strong answer (positive points), and one lukewarm answer (close to zero). Vary which letter is the strong one across the 5 questions.
- "reaction" is what the lead says right after the seller picks that option. ≤14 words, in character, first person. Cutting if the answer was weak; reserved approval if strong.
- "intro_line" is the first thing the lead says when joining the call. Short, with attitude. No "hello, my name is".
- "mood" is a short 2-4 word descriptor like "skeptical and rushed".

GLOBAL RULES
- Everything in English.
- Output JSON only. No markdown. Stick to the schema exactly.`;

const SCHEMA_HINT = `{
  "persona": {
    "archetype": "one of the shortlist slugs",
    "name": "string",
    "title": "string",
    "company": "string",
    "mood": "short string",
    "pains": ["string", "string", "string"],
    "intro_line": "string"
  },
  "questions": [
    {
      "text": "string — MUST mention something concrete from the seller's pitch",
      "options": {
        "A": { "text": "string", "points": -20..20, "reaction": "string" },
        "B": { "text": "string", "points": -20..20, "reaction": "string" },
        "C": { "text": "string", "points": -20..20, "reaction": "string" }
      }
    }
  ]
}`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const clients = (body.clients || "").trim().slice(0, 1200);
    const business = (body.business || "").trim().slice(0, 1200);

    if (!clients || !business) {
      return NextResponse.json(
        { error: "Fill in both fields before starting." },
        { status: 400 },
      );
    }

    const shortlist = pickArchetypeShortlist(4);
    const shortlistText = shortlist
      .map((c) => `- "${c.slug}" → ${c.label}: ${c.vibe}`)
      .join("\n");

    const openai = getOpenAI();

    const userPrompt = `THE SELLER described their BUSINESS like this:
"""${business}"""

And described their typical CLIENT like this:
"""${clients}"""

ARCHETYPE SHORTLIST for this run (pick exactly one slug from below — only these are allowed):
${shortlistText}

Generate a tough lead plus 5 ABC questions following all the rules. Remember: every question must name something specific from the seller's pitch above.

Schema:
${SCHEMA_HINT}`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.95,
      messages: [
        { role: "system", content: SYSTEM_BASE },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    if (!parsed?.persona || !Array.isArray(parsed?.questions) || parsed.questions.length < 3) {
      return NextResponse.json(
        { error: "The AI returned an unexpected format. Try again." },
        { status: 502 },
      );
    }

    const shortlistSlugs = new Set(shortlist.map((c) => c.slug));
    if (!shortlistSlugs.has(parsed.persona.archetype)) {
      parsed.persona.archetype = shortlist[Math.floor(Math.random() * shortlist.length)].slug;
    }

    parsed.questions = parsed.questions.slice(0, 5);
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
