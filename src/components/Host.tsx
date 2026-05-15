"use client";

import { motion } from "framer-motion";
import Avatar from "./Avatar";
import { HOST_CHARACTER } from "@/lib/characters";

type Props = {
  speech: string;
  size?: number;
};

export default function Host({ speech, size = 160 }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14, mass: 0.7 }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Avatar
            seed={HOST_CHARACTER.seed}
            backgroundColor={HOST_CHARACTER.backgroundColor}
            size={size}
            ring="navy"
          />
        </motion.div>
      </motion.div>

      <motion.div
        key={speech}
        initial={{ opacity: 0, y: 12, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="relative max-w-md rounded-3xl border-4 border-navy-900 bg-white px-6 py-4 text-center shadow-cardLift"
      >
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 h-5 w-5 rotate-45 border-l-4 border-t-4 border-navy-900 bg-white" />
        <p className="text-xl md:text-2xl font-extrabold text-navy-900 leading-snug">{speech}</p>
      </motion.div>
    </div>
  );
}
