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

const SYSTEM = `Você é o lead durão fictício gerado anteriormente no joguinho "Sell Me This Pen". A call acabou. Agora você sai do personagem o suficiente pra dar uma dica genuinamente útil pro vendedor, mas mantém um tom direto, sem rodeio, ainda com sua personalidade.

REGRAS:
- "verdict" deve ser EXATAMENTE um destes três valores: "FECHOU", "QUASE" ou "PERDEU". Use o score (0-100) como referência: >=75 fechou, 45-74 quase, <45 perdeu.
- "headline" é uma frase curta (até 16 palavras), em primeira pessoa, dizendo se você fecharia ou não, com sua personalidade. Pode ser sarcástica se ele perdeu, ou genuína se ele fechou.
- "tip" é UMA dica de business ou de venda concreta, prática e útil. Baseada no negócio descrito pelo vendedor e nas suas dores como lead. Até 3 frases. Sem clichê tipo "seja autêntico". Vá pro miolo. Em português do Brasil.
- Responda APENAS JSON válido. Sem markdown.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const persona = body.persona;
    const business = (body.business || "").slice(0, 1200);
    const clients = (body.clients || "").slice(0, 1200);
    const score = typeof body.score === "number" ? Math.max(0, Math.min(100, body.score)) : 50;
    const transcript = Array.isArray(body.transcript) ? body.transcript.slice(0, 8) : [];

    if (!persona || !business) {
      return NextResponse.json(
        { error: "Faltam dados do jogo." },
        { status: 400 },
      );
    }

    const openai = getOpenAI();

    const userPrompt = `CONTEXTO DA VENDA:
- Negócio do vendedor: """${business}"""
- Tipo de cliente que ele atende: """${clients}"""

VOCÊ É: ${persona.name}, ${persona.title} em ${persona.company}. Suas dores: ${(persona.pains || []).join(" | ")}. Seu mood: ${persona.mood}.

TRANSCRIPT DA CALL (perguntas que você fez + alternativa escolhida + sua reação + pontos):
${transcript.map((t, i) => `${i + 1}. ${t.q} → escolheu: "${t.chosen}" (${t.points >= 0 ? "+" : ""}${t.points}) → você: "${t.reaction}"`).join("\n")}

SCORE FINAL DO VENDEDOR: ${score}/100.

Gere a resposta JSON:
{
  "verdict": "FECHOU | QUASE | PERDEU",
  "headline": "frase curta em primeira pessoa",
  "tip": "dica útil em até 3 frases"
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

    const verdicts = new Set(["FECHOU", "QUASE", "PERDEU"]);
    if (!verdicts.has(parsed.verdict)) {
      parsed.verdict = score >= 75 ? "FECHOU" : score >= 45 ? "QUASE" : "PERDEU";
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    const message = err?.message || "Erro desconhecido";
    const status = err?.status === 401 ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
