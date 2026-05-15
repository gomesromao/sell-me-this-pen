"use client";

import { motion } from "framer-motion";
import type { Persona } from "@/lib/types";
import { characterFromSlug } from "@/lib/characters";
import Avatar from "./Avatar";

type Props = {
  persona: Persona;
  compact?: boolean;
  speech?: string | null;
  tilt?: "up" | "down" | "neutral";
};

const ACCENT_HALO: Record<string, string> = {
  navy: "bg-navy-500",
  coral: "bg-coral",
  sunny: "bg-sunny",
  gleam: "bg-gleam-300",
  mint: "bg-mint",
};

export default function PersonaCard({ persona, compact, speech, tilt = "neutral" }: Props) {
  const character = characterFromSlug(persona.archetype);
  const size = compact ? 96 : 160;
  const tiltAngle = tilt === "up" ? -4 : tilt === "down" ? 4 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="card relative overflow-hidden border-4 border-navy-900"
    >
      <div className="flex items-start gap-5">
        <div className="relative shrink-0">
          <div
            className={`absolute inset-0 ${ACCENT_HALO[character.accent] || "bg-mint"} rounded-full opacity-90`}
            style={{ transform: "scale(1.18)", filter: "blur(2px)" }}
          />
          <motion.div
            animate={{ rotate: tiltAngle }}
            transition={{ type: "spring", stiffness: 180, damping: 10 }}
            className="relative"
          >
            <Avatar
              seed={character.seed}
              backgroundColor={character.backgroundColor}
              size={size}
              ring="navy"
              wiggle={!compact}
            />
          </motion.div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-eyebrow">Your lead</span>
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

      {speech || persona.intro_line ? (
        <motion.div
          key={speech || persona.intro_line}
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="mt-5 relative rounded-3xl border-4 border-navy-900 bg-cream-deep px-5 py-4 text-navy-900"
        >
          <span className="absolute -top-3 left-8 w-5 h-5 rotate-45 bg-cream-deep border-l-4 border-t-4 border-navy-900" />
          <p className={`font-bold ${compact ? "text-base" : "text-lg"}`}>"{speech || persona.intro_line}"</p>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
