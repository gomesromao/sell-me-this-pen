import { NextResponse } from "next/server";
import { CHARACTERS } from "@/lib/characters";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  clients?: string;
  business?: string;
};

const ARCHETYPE_LIST = CHARACTERS.map(
  (c) => `- "${c.slug}" → ${c.label}: ${c.vibe}`,
).join("\n");

const SYSTEM = `You are the director of a sales-training game called "Sell Me This Pen", inspired by the famous scene from The Wolf of Wall Street.

Your job: generate one tough, fictional LEAD plus 5 multiple-choice questions (A/B/C) the lead will throw at the seller during a discovery call.

PERSONA RULES
- The lead is coherent with the seller's business and ideal client, but has their own personality, name, title and (made-up) company.
- Pick the best matching archetype from this list and put its slug in "archetype":
${ARCHETYPE_LIST}
- The persona's name, title and company should fit the chosen archetype and the seller's market. Do not reuse the example names from the archetype list.

QUESTION RULES
- The lead is skeptical, busy, sharp. Tough but professional — never a clown, never goofy.
- Questions should hit real objections a buyer in this market would raise: ROI, trust, switching cost, risk, edge cases, references. Mix the angles.
- Each question has 3 options (A, B, C). Each option is scored from -20 to +20 points.
- Every question MUST contain one clearly weak answer (negative points), one strong answer (positive points), and one lukewarm answer (close to zero). Vary which letter is the strong one across the 5 questions.
- "reaction" is what the lead says right after the seller picks that option. ≤14 words, in character, first person. Dry, sharp, sometimes cutting if the answer was weak; impressed but reserved if the answer was strong.
- "intro_line" is the first thing the lead says when joining the call. Short, with attitude. No greetings like "hello, my name is".
- "mood" is a short 2-4 word descriptor like "skeptical and rushed".

GLOBAL RULES
- Everything must be written in English.
- Output JSON only. No markdown. Stick to the schema exactly.`;

const SCHEMA_HINT = `{
  "persona": {
    "archetype": "one of the slugs above",
    "name": "string",
    "title": "string",
    "company": "string",
    "mood": "short string",
    "pains": ["string", "string", "string"],
    "intro_line": "string"
  },
  "questions": [
    {
      "text": "string",
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

    const openai = getOpenAI();

    const userPrompt = `THE SELLER described their BUSINESS like this:
"""${business}"""

And described their typical CLIENT like this:
"""${clients}"""

Generate a tough lead that fits this context, plus 5 ABC questions. Pick the most fitting archetype slug.

Schema:
${SCHEMA_HINT}`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.9,
      messages: [
        { role: "system", content: SYSTEM },
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

    // Validate archetype, fall back to random if mismatched
    const validSlugs = new Set(CHARACTERS.map((c) => c.slug));
    if (!validSlugs.has(parsed.persona.archetype)) {
      parsed.persona.archetype = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)].slug;
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
