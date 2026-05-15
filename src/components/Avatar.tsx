"use client";

import { motion } from "framer-motion";
import { dicebearUrl } from "@/lib/characters";

type Props = {
  seed: string;
  backgroundColor: string;
  size?: number;
  ring?: "navy" | "cream" | "white";
  className?: string;
  wiggle?: boolean;
};

export default function Avatar({ seed, backgroundColor, size = 144, ring = "navy", className = "", wiggle = true }: Props) {
  const url = dicebearUrl(seed, backgroundColor, size);
  const ringClass =
    ring === "white" ? "border-white" : ring === "cream" ? "border-cream-deep" : "border-navy-900";

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      animate={wiggle ? { rotate: [0, -3, 3, -2, 0] } : undefined}
      transition={wiggle ? { duration: 4.2, repeat: Infinity, ease: "easeInOut" } : undefined}
      style={{ width: size, height: size }}
    >
      <div
        className={`absolute inset-0 rounded-full border-4 ${ringClass} overflow-hidden bg-cream`}
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          width={size}
          height={size}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    </motion.div>
  );
}
