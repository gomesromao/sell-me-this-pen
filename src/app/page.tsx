"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Host from "@/components/Host";
import PersonaCard from "@/components/PersonaCard";
import QuestionStage from "@/components/QuestionStage";
import ReadyScreen from "@/components/ReadyScreen";
import SetupStep from "@/components/SetupStep";
import Verdict from "@/components/Verdict";
import type { FinishResponse, Persona, Question, StartResponse } from "@/lib/types";
import { pushRecentArchetype, readRecentArchetypes } from "@/lib/recent";

type Stage = "setup1" | "setup2" | "ready" | "loading" | "reveal" | "playing" | "finishing" | "verdict";

const LOADING_LINES = [
  "summoning your lead...",
  "loading them up with skepticism...",
  "sharpening five tough questions...",
  "checking your pitch for weak spots...",
  "ok, they're walking in...",
];

export default function Home() {
  const [stage, setStage] = useState<Stage>("setup1");
  const [business, setBusiness] = useState("");
  const [clients, setClients] = useState("");
  const [persona, setPersona] = useState<Persona | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(50);
  const [transcript, setTranscript] = useState<Array<{ q: string; chosen: string; reaction: string; points: number }>>([]);
  const [result, setResult] = useState<FinishResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingLineIdx, setLoadingLineIdx] = useState(0);

  useEffect(() => {
    if (stage !== "loading") return;
    const id = setInterval(() => setLoadingLineIdx((i) => (i + 1) % LOADING_LINES.length), 1900);
    return () => clearInterval(id);
  }, [stage]);

  async function callStart() {
    setError(null);
    setStage("loading");
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clients,
          business,
          exclude_archetypes: readRecentArchetypes(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate lead");
      const parsed = data as StartResponse;
      pushRecentArchetype(parsed.persona.archetype);
      setPersona(parsed.persona);
      setQuestions(parsed.questions);
      setStage("reveal");
      setTimeout(() => setStage("playing"), 2600);
    } catch (e: any) {
      setError(e.message);
      setStage("ready");
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
      if (!res.ok) throw new Error(data.error || "Verdict failed");
      setResult(data);
      setStage("verdict");
    } catch (e: any) {
      setResult({
        verdict: payload.score >= 75 ? "CLOSED" : payload.score >= 45 ? "ALMOST" : "LOST",
        headline: "Call's over. The AI choked on the verdict, but you made it through.",
        tip: e.message || "Give it another shot.",
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
    setError(null);
    setStage("setup1");
  }

  return (
    <main className="min-h-screen">
      <header className="px-6 pt-8 flex items-center justify-between max-w-4xl mx-auto">
        <span className="chip">Coconut VA · Sales Trainer</span>
        <span className="chip bg-sunny text-navy-900">Beta</span>
      </header>

      <AnimatePresence mode="wait">
        {stage === "setup1" && (
          <SetupStep
            key="setup1"
            step={1}
            question="First — tell me about your business."
            placeholder="Local marketing consultancy: 30-day sprints focused on Google Maps, paid ads, and WhatsApp Business. Refund guarantee if we don't generate 20 leads."
            initialValue={business}
            onNext={(v) => {
              setBusiness(v);
              setStage("setup2");
            }}
          />
        )}

        {stage === "setup2" && (
          <SetupStep
            key="setup2"
            step={2}
            question="Now — tell me more about your clients."
            placeholder="Owners of dental clinics with 1–5 chairs. They want more bookings but keep losing inbound calls. $30–80k/month revenue."
            initialValue={clients}
            onNext={(v) => {
              setClients(v);
              setStage("ready");
            }}
            onBack={() => setStage("setup1")}
          />
        )}

        {stage === "ready" && (
          <ReadyScreen
            key="ready"
            onStart={callStart}
            onBack={() => setStage("setup2")}
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
            className="mx-auto max-w-2xl px-6 py-20 text-center flex flex-col items-center"
          >
            <Host speech={LOADING_LINES[loadingLineIdx]} size={180} />
            <p className="mt-6 text-navy-500 text-sm">10–20 seconds. AI is in character.</p>
          </motion.div>
        )}

        {stage === "reveal" && persona && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="mx-auto max-w-3xl px-6 py-12"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1.05, 1] }}
              transition={{ duration: 0.7 }}
              className="mb-5 text-center"
            >
              <span className="chip bg-sunny text-navy-900">Lead joining the call...</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy-900">
                Meet your lead.
              </h2>
            </motion.div>
            <PersonaCard persona={persona} />
          </motion.div>
        )}

        {stage === "playing" && persona && (
          <QuestionStage key="playing" persona={persona} questions={questions} onComplete={handleComplete} />
        )}

        {stage === "finishing" && persona && (
          <motion.div
            key="finishing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-2xl px-6 py-20 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, -4, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="text-7xl mb-6"
            >
              🥁
            </motion.div>
            <h2 className="text-3xl font-extrabold text-navy-900">
              {persona.name} is thinking...
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
