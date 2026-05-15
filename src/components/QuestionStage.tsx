"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { AnswerKey, Persona, Question } from "@/lib/types";
import ChanceBar from "./ChanceBar";
import PersonaCard from "./PersonaCard";

type Props = {
  persona: Persona;
  questions: Question[];
  onComplete: (result: {
    score: number;
    transcript: Array<{ q: string; chosen: string; reaction: string; points: number }>;
  }) => void;
};

const LETTERS: AnswerKey[] = ["A", "B", "C"];

export default function QuestionStage({ persona, questions, onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(50);
  const [transcript, setTranscript] = useState<Array<{ q: string; chosen: string; reaction: string; points: number }>>([]);
  const [picked, setPicked] = useState<AnswerKey | null>(null);
  const [speech, setSpeech] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const q = questions[idx];

  function choose(letter: AnswerKey) {
    if (picked || advancing) return;
    const opt = q.options[letter];
    setPicked(letter);
    setSpeech(opt.reaction);
    const nextScore = Math.max(0, Math.min(100, score + opt.points));
    setScore(nextScore);
    const entry = { q: q.text, chosen: opt.text, reaction: opt.reaction, points: opt.points };
    const nextTranscript = [...transcript, entry];
    setTranscript(nextTranscript);
    setAdvancing(true);

    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        onComplete({ score: nextScore, transcript: nextTranscript });
      } else {
        setIdx(idx + 1);
        setPicked(null);
        setSpeech(null);
        setAdvancing(false);
      }
    }, 1600);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:py-14 space-y-6">
      <PersonaCard persona={persona} compact speech={speech} />
      <ChanceBar value={score} />

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <span className="label-eyebrow">Pergunta {idx + 1} de {questions.length}</span>
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${i < idx ? "bg-gleam-500" : i === idx ? "bg-navy-900" : "bg-navy-100"}`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.h3
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-2xl md:text-3xl font-extrabold text-navy-900 leading-tight"
          >
            {q.text}
          </motion.h3>
        </AnimatePresence>

        <div className="mt-6 space-y-3">
          {LETTERS.map((letter) => {
            const opt = q.options[letter];
            const isPicked = picked === letter;
            const isOther = picked && !isPicked;
            return (
              <button
                key={letter}
                type="button"
                disabled={!!picked}
                onClick={() => choose(letter)}
                className={`w-full text-left rounded-2xl border-2 px-5 py-4 flex gap-4 items-start transition
                  ${isPicked ? "border-navy-900 bg-mint shadow-cardLift" : ""}
                  ${isOther ? "border-navy-100 bg-white opacity-50" : ""}
                  ${!picked ? "border-navy-100 bg-white hover:border-navy-900 hover:-translate-y-0.5 hover:shadow-card" : ""}`}
              >
                <span className="chip bg-navy-900 text-cream shrink-0">{letter}</span>
                <span className="text-navy-900 font-semibold leading-snug">{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
