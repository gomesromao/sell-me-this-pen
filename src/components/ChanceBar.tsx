"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  value: number;
  delta?: number | null;
};

export default function ChanceBar({ value, delta }: Props) {
  const safe = Math.max(0, Math.min(100, value));
  const mv = useMotionValue(safe);
  const spring = useSpring(mv, { stiffness: 120, damping: 14, mass: 0.9 });
  const widthPct = useTransform(spring, (v) => `${v}%`);
  const [displayed, setDisplayed] = useState(safe);

  useEffect(() => {
    mv.set(safe);
    const unsub = spring.on("change", (v) => setDisplayed(Math.round(v)));
    return () => unsub();
  }, [safe, mv, spring]);

  const tone =
    displayed >= 75 ? "from-gleam-500 to-gleam-300"
    : displayed >= 45 ? "from-sunny to-gleam-300"
    : "from-coral-deep to-sunny";

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-2">
        <span className="label-eyebrow">Chance to close</span>
        <div className="flex items-center gap-2">
          {delta != null && delta !== 0 ? (
            <motion.span
              key={`${delta}-${Math.random()}`}
              initial={{ y: 6, opacity: 0, scale: 0.6 }}
              animate={{ y: -22, opacity: [0, 1, 1, 0], scale: 1 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className={`text-xl font-extrabold ${delta > 0 ? "text-gleam-700" : "text-coral-deep"}`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </motion.span>
          ) : null}
          <motion.span
            key={`${displayed >= 75 ? "hi" : displayed >= 45 ? "mid" : "lo"}-${Math.round(displayed / 5)}`}
            initial={{ scale: 0.7, rotate: -6 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 14 }}
            className="text-4xl font-extrabold text-navy-900 tabular-nums"
          >
            {displayed}%
          </motion.span>
        </div>
      </div>
      <div className="relative h-7 w-full rounded-full border-4 border-navy-900 bg-cream-deep overflow-hidden shadow-chip">
        <motion.div
          className={`h-full bg-gradient-to-r ${tone}`}
          style={{ width: widthPct }}
        />
        <div className="pointer-events-none absolute inset-0 flex justify-between px-[10%]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-px bg-navy-900/15" />
          ))}
        </div>
      </div>
    </div>
  );
}
