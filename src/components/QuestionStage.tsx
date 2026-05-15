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
  const [lastDelta, setLastDelta] = useState<number | null>(null);
  const [transcript, setTranscript] = useState<Array<{ q: string; chosen: string; reaction: string; points: number }>>([]);
  const [picked, setPicked] = useState<AnswerKey | null>(null);
  const [speech, setSpeech] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const q = questions[idx];
  const tilt = lastDelta == null ? "neutral" : lastDelta > 0 ? "up" : lastDelta < 0 ? "down" : "neutral";

  function choose(letter: AnswerKey) {
    if (picked || advancing) return;
    const opt = q.options[letter];
    setPicked(letter);
    setSpeech(opt.reaction);
    setLastDelta(opt.points);
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
        setLastDelta(null);
        setAdvancing(false);
      }
    }, 1800);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl px-6 py-8 md:py-12 space-y-6"
    >
      <PersonaCard persona={persona} compact speech={speech} tilt={tilt} />
      <ChanceBar value={score} delta={lastDelta} />

      <motion.div
        layout
        className="card border-4 border-navy-900"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="label-eyebrow">Question {idx + 1} of {questions.length}</span>
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
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
            className="text-2xl md:text-3xl font-extrabold text-navy-900 leading-tight"
          >
            {q.text}
          </motion.h3>
        </AnimatePresence>

        <div className="mt-6 space-y-3">
          {LETTERS.map((letter, i) => {
            const opt = q.options[letter];
            const isPicked = picked === letter;
            const isOther = picked && !isPicked;
            return (
              <motion.button
                key={letter}
                type="button"
                disabled={!!picked}
                onClick={() => choose(letter)}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 260, damping: 20 }}
                whileHover={!picked ? { x: 4, rotate: -0.3 } : undefined}
                whileTap={!picked ? { scale: 0.97 } : undefined}
                className={`w-full text-left rounded-2xl border-4 px-5 py-4 flex gap-4 items-start transition
                  ${isPicked ? "border-navy-900 bg-mint shadow-cardLift" : ""}
                  ${isOther ? "border-navy-100 bg-white opacity-50" : ""}
                  ${!picked ? "border-navy-100 bg-white hover:border-navy-900 hover:shadow-card" : ""}`}
              >
                <span className="chip bg-navy-900 text-cream shrink-0">{letter}</span>
                <span className="text-navy-900 font-semibold leading-snug">{opt.text}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
