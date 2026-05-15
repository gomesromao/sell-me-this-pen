"use client";

import { motion } from "framer-motion";
import type { Persona } from "@/lib/types";

type Props = {
  persona: Persona;
  compact?: boolean;
  speech?: string | null;
};

const haloBg: Record<Persona["accent_color"], string> = {
  navy: "bg-navy-500",
  coral: "bg-coral",
  sunny: "bg-sunny",
  gleam: "bg-gleam-300",
};

export default function PersonaCard({ persona, compact, speech }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="card relative overflow-hidden"
    >
      <div className="flex items-start gap-5">
        <div className="relative shrink-0">
          <div className={`absolute inset-0 ${haloBg[persona.accent_color] || "bg-mint"} rounded-full scale-110 blur-[2px] opacity-90`} />
          <div className={`relative grid place-items-center rounded-full ${compact ? "w-16 h-16 text-3xl" : "w-24 h-24 text-5xl"} bg-white border-2 border-navy-900`}>
            <span aria-hidden>{persona.avatar_emoji || "🧐"}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-eyebrow">Seu lead</span>
            <span className="chip">{persona.mood}</span>
          </div>
          <h2 className={`mt-1 font-extrabold text-navy-900 ${compact ? "text-xl" : "text-3xl"}`}>
            {persona.name}
          </h2>
          <p className="text-navy-700">
            <span className="font-bold">{persona.title}</span> · {persona.company}
          </p>
          {!compact && persona.pains?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {persona.pains.map((p, i) => (
                <span key={i} className="chip bg-cream-deep text-navy-700">{p}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {(speech || persona.intro_line) ? (
        <motion.div
          key={speech || persona.intro_line}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 relative rounded-2xl border-2 border-navy-900 bg-cream-deep px-5 py-4 text-navy-900"
        >
          <span className="absolute -top-2 left-8 w-4 h-4 rotate-45 bg-cream-deep border-l-2 border-t-2 border-navy-900" />
          <p className={`font-bold ${compact ? "text-base" : "text-lg"}`}>"{speech || persona.intro_line}"</p>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
