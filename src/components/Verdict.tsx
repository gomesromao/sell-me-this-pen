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
  FECHOU: { emoji: "🎉", tone: "bg-gleam-300 text-navy-900", label: "Fechou negócio" },
  QUASE: { emoji: "😬", tone: "bg-sunny text-navy-900", label: "Passou perto" },
  PERDEU: { emoji: "💀", tone: "bg-coral text-navy-900", label: "Perdeu o lead" },
};

export default function Verdict({ persona, result, score, onPlayAgain }: Props) {
  const meta = VERDICT_META[result.verdict] || VERDICT_META.QUASE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-6 py-10 md:py-14 space-y-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.6, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 12 }}
          className="text-8xl mb-3"
          aria-hidden
        >
          {meta.emoji}
        </motion.div>
        <span className={`chip ${meta.tone}`}>{meta.label} · {score}%</span>
        <h2 className="mt-4 text-4xl md:text-6xl font-extrabold text-navy-900 leading-[0.95]">
          {result.headline}
        </h2>
      </div>

      <PersonaCard persona={persona} compact speech={null} />

      <div className="card bg-cream-deep border-2 border-navy-900">
        <div className="label-eyebrow mb-2">Dica do {persona.name.split(" ")[0]}</div>
        <p className="text-lg md:text-xl text-navy-900 leading-relaxed font-semibold">
          {result.tip}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-center">
        <button type="button" onClick={onPlayAgain} className="pill-primary text-lg">
          Jogar de novo →
        </button>
        <button
          type="button"
          onClick={() => {
            const text = `Encarei um lead durão no Sell Me This Pen e fiz ${score}%. ${result.headline}`;
            if (navigator.share) {
              navigator.share({ title: "Sell Me This Pen", text }).catch(() => {});
            } else {
              navigator.clipboard?.writeText(text).catch(() => {});
            }
          }}
          className="pill-ghost text-lg"
        >
          Compartilhar
        </button>
      </div>
    </motion.div>
  );
}
