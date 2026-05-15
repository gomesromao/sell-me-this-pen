"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Intro from "@/components/Intro";
import PersonaCard from "@/components/PersonaCard";
import QuestionStage from "@/components/QuestionStage";
import Verdict from "@/components/Verdict";
import type { FinishResponse, Persona, Question, StartResponse } from "@/lib/types";

type Stage = "intro" | "loading" | "reveal" | "playing" | "finishing" | "verdict";

const LOADING_LINES = [
  "convocando o lead...",
  "afiando perguntas zoadas...",
  "colocando o lead de mau humor...",
  "regulando a barra de fechamento...",
  "lendo o teu pitch nas entrelinhas...",
];

export default function Home() {
  const [stage, setStage] = useState<Stage>("intro");
  const [clients, setClients] = useState("");
  const [business, setBusiness] = useState("");
  const [persona, setPersona] = useState<Persona | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(50);
  const [transcript, setTranscript] = useState<Array<{ q: string; chosen: string; reaction: string; points: number }>>([]);
  const [result, setResult] = useState<FinishResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingLineIdx, setLoadingLineIdx] = useState(0);

  async function handleStart(cl: string, bz: string) {
    setClients(cl);
    setBusiness(bz);
    setError(null);
    setStage("loading");

    const interval = setInterval(() => {
      setLoadingLineIdx((i) => (i + 1) % LOADING_LINES.length);
    }, 1800);

    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: cl, business: bz }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao gerar lead");
      const parsed = data as StartResponse;
      setPersona(parsed.persona);
      setQuestions(parsed.questions);
      setStage("reveal");
      setTimeout(() => setStage("playing"), 2200);
    } catch (e: any) {
      setError(e.message);
      setStage("intro");
    } finally {
      clearInterval(interval);
    }
  }

  async function handleComplete(payload: { score: number; transcript: typeof transcript }) {
    setScore(payload.score);
    setTranscript(payload.transcript);
    setStage("finishing");
    try {
      const res = await fetch("/api/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona,
          business,
          clients,
          score: payload.score,
          transcript: payload.transcript,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no veredito");
      setResult(data);
      setStage("verdict");
    } catch (e: any) {
      setResult({
        verdict: payload.score >= 75 ? "FECHOU" : payload.score >= 45 ? "QUASE" : "PERDEU",
        headline: "Acabou a call. A AI travou no final, mas você foi até o fim.",
        tip: e.message || "Tenta de novo daqui a pouco.",
      });
      setStage("verdict");
    }
  }

  function handlePlayAgain() {
    setPersona(null);
    setQuestions([]);
    setScore(50);
    setTranscript([]);
    setResult(null);
    setStage("intro");
  }

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        {stage === "intro" && (
          <Intro
            key="intro"
            initialClients={clients}
            initialBusiness={business}
            onStart={handleStart}
            loading={false}
            error={error}
          />
        )}

        {stage === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-2xl px-6 py-24 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="text-8xl mb-6"
            >
              🖊️
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900">
              {LOADING_LINES[loadingLineIdx]}
            </h2>
            <p className="mt-3 text-navy-500">isso pode levar uns 10–15 segundos.</p>
          </motion.div>
        )}

        {stage === "reveal" && persona && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="mx-auto max-w-3xl px-6 py-12"
          >
            <div className="mb-5 text-center">
              <span className="chip bg-sunny text-navy-900">Lead na linha</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy-900">
                Olha quem entrou na call.
              </h2>
            </div>
            <PersonaCard persona={persona} />
          </motion.div>
        )}

        {stage === "playing" && persona && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuestionStage persona={persona} questions={questions} onComplete={handleComplete} />
          </motion.div>
        )}

        {stage === "finishing" && persona && (
          <motion.div
            key="finishing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-2xl px-6 py-24 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="text-7xl mb-6"
            >
              🥁
            </motion.div>
            <h2 className="text-3xl font-extrabold text-navy-900">
              {persona.name} tá pensando...
            </h2>
          </motion.div>
        )}

        {stage === "verdict" && persona && result && (
          <Verdict key="verdict" persona={persona} result={result} score={score} onPlayAgain={handlePlayAgain} />
        )}
      </AnimatePresence>

      <footer className="py-10 text-center text-xs text-navy-500">
        Coconut VA · Sell Me This Pen
      </footer>
    </main>
  );
}
