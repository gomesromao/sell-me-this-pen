"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  value: number; // 0-100
};

export default function ChanceBar({ value }: Props) {
  const safe = Math.max(0, Math.min(100, value));
  const mv = useMotionValue(safe);
  const spring = useSpring(mv, { stiffness: 90, damping: 16, mass: 0.9 });
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
        <span className="label-eyebrow">Chance de fechar</span>
        <motion.span
          key={displayed >= 75 ? "hi" : displayed >= 45 ? "mid" : "lo"}
          initial={{ scale: 0.85, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-extrabold text-navy-900 tabular-nums"
        >
          {displayed}%
        </motion.span>
      </div>
      <div className="relative h-6 w-full rounded-full border-2 border-navy-900 bg-cream-deep overflow-hidden shadow-chip">
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
