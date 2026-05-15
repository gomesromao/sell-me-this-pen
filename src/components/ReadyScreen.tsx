"use client";

import { motion } from "framer-motion";
import Host from "./Host";

type Props = {
  onStart: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
};

export default function ReadyScreen({ onStart, onBack, loading, error }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="mx-auto max-w-2xl px-6 py-12 md:py-20 flex flex-col items-center text-center"
    >
      <Host speech="Are you ready for your lead?" size={180} />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-lg text-navy-700 max-w-md"
      >
        They're tough. They'll ask 5 sharp questions. Survive the call and you walk away with a real tip for your business.
      </motion.p>

      {error ? (
        <div className="mt-6 w-full rounded-2xl border-4 border-coral-deep bg-coral/30 px-5 py-4 text-navy-900">
          <strong className="font-extrabold">Something blocked us:</strong> {error}
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onBack} className="pill-ghost">
          ← Back
        </button>
        <motion.button
          type="button"
          disabled={loading}
          onClick={onStart}
          whileHover={!loading ? { scale: 1.06, rotate: -1 } : undefined}
          whileTap={!loading ? { scale: 0.95 } : undefined}
          className="pill-primary text-xl"
        >
          {loading ? "Summoning your lead..." : "Face the lead →"}
        </motion.button>
      </div>
      <p className="mt-3 text-xs text-navy-500">
        {loading ? "this takes 10–20 seconds — the AI is in character" : "It takes ~10–20 seconds to set the stage"}
      </p>
    </motion.div>
  );
}
