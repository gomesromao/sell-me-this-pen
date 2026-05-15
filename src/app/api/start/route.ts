import { NextResponse } from "next/server";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  clients?: string;
  business?: string;
};

const SYSTEM = `Você é o diretor de um joguinho chamado "Sell Me This Pen", inspirado naquela cena clássica do Wolf of Wall Street.
Sua função é gerar um LEAD durão e fictício e o roteiro de 5 perguntas em formato ABC que esse lead vai disparar contra o vendedor.

REGRAS DE OURO:
- O lead é coerente com o perfil de cliente descrito pelo vendedor, mas tem personalidade própria, com nome, cargo e empresa fictícios.
- Ele é cético, ocupado, e bem objetivo. Não é antipático gratuitamente, mas testa o vendedor.
- O tom das perguntas pode ser um pouco zoado, debochado, inesperado, mas SEM perder a coerência com a venda. Tipo: "se você desaparecer amanhã, em quem eu confio? por quê?" ou "me convence em uma frase ou tô saindo dessa call agora".
- Cada pergunta tem 3 alternativas (A, B, C). Cada uma vale entre -20 e +20 pontos.
- Distribuição dos pontos por pergunta: deve haver pelo menos uma resposta ruim (negativa), pelo menos uma boa (positiva) e uma morna. NÃO faça todas iguais.
- A "reaction" é uma frase curta (até 14 palavras) que o lead solta logo após o vendedor escolher aquela opção. Em primeira pessoa, com a personalidade do lead. Pode ser sarcástica se a resposta foi ruim, intrigada se foi morna, ou um aceno se foi boa.
- "intro_line" é a primeira fala do lead ao "entrar na call". Curta, com personalidade.
- "accent_color" escolha um entre: navy, coral, sunny, gleam. Combine com a vibe da persona.
- "avatar_emoji" um único emoji que represente o lead.
- Sempre em português do Brasil.
- Responda APENAS JSON válido seguindo o schema. Sem markdown.`;

const SCHEMA_HINT = `{
  "persona": {
    "name": "string",
    "title": "string",
    "company": "string",
    "mood": "string curta tipo 'cético e apressado'",
    "avatar_emoji": "1 emoji",
    "pains": ["string", "string", "string"],
    "intro_line": "string",
    "accent_color": "navy | coral | sunny | gleam"
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
        { error: "Preencha os dois campos antes de começar." },
        { status: 400 },
      );
    }

    const openai = getOpenAI();

    const userPrompt = `O VENDEDOR descreveu o NEGÓCIO dele assim:
"""${business}"""

E descreveu o tipo de CLIENTE que ele atende assim:
"""${clients}"""

Gere um lead durão coerente com esse contexto + 5 perguntas ABC.
Schema:
${SCHEMA_HINT}`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.95,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    if (!parsed?.persona || !Array.isArray(parsed?.questions) || parsed.questions.length < 3) {
      return NextResponse.json(
        { error: "A AI devolveu um formato inesperado. Tenta de novo." },
        { status: 502 },
      );
    }

    // Trim/normalize to 5 questions
    parsed.questions = parsed.questions.slice(0, 5);
    return NextResponse.json(parsed);
  } catch (err: any) {
    const message = err?.message || "Erro desconhecido";
    const status = err?.status === 401 ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
