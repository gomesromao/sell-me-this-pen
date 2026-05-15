"use client";

import { motion } from "framer-motion";
import type { FinishResponse, Persona } from "@/lib/types";
import PersonaCard from "./PersonaCard";

type Props = {
  persona: Persona;
  result: FinishResponse;
  score: number;
  onPlayAgain: () => void;
};

const VERDICT_META: Record<FinishResponse["verdict"], { emoji: string; tone: string; label: string }> = {
  CLOSED: { emoji: "🎉", tone: "bg-gleam-300 text-navy-900", label: "Deal closed" },
  ALMOST: { emoji: "😬", tone: "bg-sunny text-navy-900", label: "So close" },
  LOST: { emoji: "💀", tone: "bg-coral text-navy-900", label: "Lead walked" },
};

export default function Verdict({ persona, result, score, onPlayAgain }: Props) {
  const meta = VERDICT_META[result.verdict] || VERDICT_META.ALMOST;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-6 py-10 md:py-14 space-y-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: [0, 1.25, 1], rotate: [- 25, 8, 0] }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="text-8xl mb-3"
          aria-hidden
        >
          {meta.emoji}
        </motion.div>
        <span className={`chip ${meta.tone}`}>{meta.label} · {score}%</span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 22 }}
          className="mt-4 text-4xl md:text-6xl font-extrabold text-navy-900 leading-[0.95]"
        >
          {result.headline}
        </motion.h2>
      </div>

      <PersonaCard persona={persona} compact speech={null} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 220, damping: 22 }}
        className="card bg-cream-deep border-4 border-navy-900"
      >
        <div className="label-eyebrow mb-2">Tip from {persona.name.split(" ")[0]}</div>
        <p className="text-lg md:text-xl text-navy-900 leading-relaxed font-semibold">
          {result.tip}
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-3 justify-center">
        <motion.button
          type="button"
          onClick={onPlayAgain}
          whileHover={{ scale: 1.04, rotate: -1 }}
          whileTap={{ scale: 0.96 }}
          className="pill-primary text-lg"
        >
          Play again →
        </motion.button>
        <button
          type="button"
          onClick={() => {
            const text = `I faced a tough lead on Sell Me This Pen and scored ${score}%. ${result.headline}`;
            if (navigator.share) {
              navigator.share({ title: "Sell Me This Pen", text }).catch(() => {});
            } else {
              navigator.clipboard?.writeText(text).catch(() => {});
            }
          }}
          className="pill-ghost text-lg"
        >
          Share
        </button>
      </div>
    </motion.div>
  );
}
