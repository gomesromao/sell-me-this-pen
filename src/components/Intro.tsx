"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  initialClients?: string;
  initialBusiness?: string;
  onStart: (clients: string, business: string) => void;
  loading: boolean;
  error: string | null;
};

const MAX = 1200;

export default function Intro({ initialClients = "", initialBusiness = "", onStart, loading, error }: Props) {
  const [clients, setClients] = useState(initialClients);
  const [business, setBusiness] = useState(initialBusiness);

  const ready = clients.trim().length > 8 && business.trim().length > 8 && !loading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto max-w-3xl px-6 py-12 md:py-20"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="chip">Coconut VA · Trainer</span>
        <span className="chip bg-sunny text-navy-900">Beta</span>
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95] text-navy-900">
        Sell me <span className="text-gleam-500">this pen.</span>
      </h1>
      <p className="mt-5 text-lg md:text-xl text-navy-700 max-w-2xl">
        Um lead durão criado por AI vai te metralhar com 5 perguntas zoadas (mas justas).
        Suba a barra de fechamento, sobreviva, e leva uma dica genuína pro seu business.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Field
          label="Me fala sobre seus clientes"
          hint="Quem são, o que sentem, o que tentam resolver."
          value={clients}
          onChange={setClients}
          placeholder="Donos de clínica odonto, 1-5 cadeiras, querem mais agendamentos mas perdem ligação."
        />
        <Field
          label="Me fala sobre seu negócio"
          hint="O que você vende, como entrega, o diferencial."
          value={business}
          onChange={setBusiness}
          placeholder="Consultoria de marketing local, sprint de 30 dias, foco em Google Maps e anúncios pagos."
        />
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border-2 border-coral-deep bg-coral/30 px-5 py-4 text-navy-900">
          <strong className="font-extrabold">Algo travou:</strong> {error}
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={!ready}
          onClick={() => onStart(clients.trim(), business.trim())}
          className="pill-primary text-lg"
        >
          {loading ? "Convocando lead..." : "Encare o lead →"}
        </button>
        <span className="text-sm text-navy-500">
          {loading ? "afiando perguntas, isso leva uns segundos..." : "leva ~10s pra montar o cenário"}
        </span>
      </div>
    </motion.div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <div className="label-eyebrow mb-2">{label}</div>
      <textarea
        className="input-field min-h-[160px] resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX))}
        placeholder={placeholder}
        rows={6}
      />
      <div className="mt-1 flex justify-between text-xs text-navy-500">
        <span>{hint}</span>
        <span>{value.length}/{MAX}</span>
      </div>
    </label>
  );
}
