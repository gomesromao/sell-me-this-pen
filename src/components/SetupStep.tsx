"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Host from "./Host";

type Props = {
  step: 1 | 2;
  question: string;
  placeholder: string;
  initialValue: string;
  onNext: (value: string) => void;
  onBack?: () => void;
};

const MAX = 1200;
const MIN = 6;

export default function SetupStep({ step, question, placeholder, initialValue, onNext, onBack }: Props) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const ready = value.trim().length >= MIN;

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="mx-auto max-w-2xl px-6 py-10 md:py-16 flex flex-col items-center"
    >
      <div className="mb-8 flex items-center gap-2">
        <Dot active={step >= 1} done={step > 1} />
        <Connector active={step > 1} />
        <Dot active={step >= 2} done={step > 2} />
        <Connector active={step > 2} />
        <Dot active={false} done={false} />
      </div>

      <Host speech={question} />

      <div className="mt-8 w-full">
        <textarea
          ref={textareaRef}
          className="input-field min-h-[140px] resize-none text-lg"
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && ready) {
              onNext(value.trim());
            }
          }}
          placeholder={placeholder}
          rows={5}
        />
        <div className="mt-2 flex justify-between text-xs text-navy-500">
          <span>Tip: be specific. The lead is only as sharp as your inputs.</span>
          <span>{value.length}/{MAX}</span>
        </div>
      </div>

      <div className="mt-8 flex w-full flex-wrap items-center justify-between gap-3">
        {onBack ? (
          <button type="button" onClick={onBack} className="pill-ghost">
            ← Back
          </button>
        ) : (
          <span />
        )}
        <motion.button
          type="button"
          disabled={!ready}
          onClick={() => onNext(value.trim())}
          whileHover={ready ? { scale: 1.04, rotate: -1 } : undefined}
          whileTap={ready ? { scale: 0.96 } : undefined}
          className="pill-primary text-lg"
        >
          Next →
        </motion.button>
      </div>
    </motion.div>
  );
}

function Dot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <motion.span
      animate={{ scale: active && !done ? [1, 1.2, 1] : 1 }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      className={`h-3 w-3 rounded-full border-2 border-navy-900
        ${done ? "bg-gleam-500" : active ? "bg-sunny" : "bg-cream"}`}
    />
  );
}

function Connector({ active }: { active: boolean }) {
  return <span className={`h-0.5 w-10 ${active ? "bg-navy-900" : "bg-navy-100"}`} />;
}
