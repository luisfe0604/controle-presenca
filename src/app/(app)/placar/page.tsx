"use client";

import { useEffect, useState } from "react";
import {
  PLACAR_PRESETS,
  DEFAULT_PLACAR_PRESET,
  PLACAR_COR_STORAGE_KEY,
} from "@/lib/placar-colors";
import { ColorPicker } from "./ColorPicker";

interface TeamScoreProps {
  nome: string;
  valor: number;
  flip: boolean;
  preset: (typeof PLACAR_PRESETS)[string];
  onIncrementar: () => void;
  onDecrementar: () => void;
}

function TeamScore({
  nome,
  valor,
  flip,
  preset,
  onIncrementar,
  onDecrementar,
}: TeamScoreProps) {
  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <p className="mb-4 text-lg tracking-[0.15em] text-white/90">{nome}</p>
      <div
        className={`tabular inline-block min-w-[120px] rounded-2xl px-10 py-5 text-6xl font-bold text-white sm:text-7xl ${
          flip ? "placar-flip" : ""
        }`}
        style={{
          background: preset.scoreBg,
          boxShadow: `inset 0 -8px 0 rgba(0,0,0,0.2), 0 5px 15px ${preset.scoreShadow}`,
        }}
      >
        {valor}
      </div>
      <div className="mt-5 flex justify-center gap-3">
        <button
          onClick={onIncrementar}
          aria-label={`Aumentar placar do ${nome}`}
          className="rounded-xl px-6 py-3 text-lg font-bold text-white transition-transform hover:scale-110"
          style={{ background: preset.btnBg }}
          onMouseEnter={(e) => (e.currentTarget.style.background = preset.btnHoverBg)}
          onMouseLeave={(e) => (e.currentTarget.style.background = preset.btnBg)}
        >
          +
        </button>
        <button
          onClick={onDecrementar}
          aria-label={`Diminuir placar do ${nome}`}
          className="rounded-xl px-6 py-3 text-lg font-bold text-white transition-transform hover:scale-110"
          style={{ background: preset.btnBg }}
          onMouseEnter={(e) => (e.currentTarget.style.background = preset.btnHoverBg)}
          onMouseLeave={(e) => (e.currentTarget.style.background = preset.btnBg)}
        >
          −
        </button>
      </div>
    </div>
  );
}

export default function PlacarPage() {
  const [presetId, setPresetId] = useState(DEFAULT_PLACAR_PRESET);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [flipA, setFlipA] = useState(false);
  const [flipB, setFlipB] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(PLACAR_COR_STORAGE_KEY);
    if (stored && stored in PLACAR_PRESETS) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPresetId(stored);
    }
  }, []);

  function selecionarCor(id: string) {
    setPresetId(id);
    window.localStorage.setItem(PLACAR_COR_STORAGE_KEY, id);
  }

  function alterar(time: "A" | "B", delta: number) {
    const setFlip = time === "A" ? setFlipA : setFlipB;
    const setScore = time === "A" ? setScoreA : setScoreB;

    setFlip(true);
    // Usa a forma funcional para não perder incrementos em cliques rápidos
    // (o valor "atual" no fechamento pode estar desatualizado até o timeout rodar).
    window.setTimeout(() => setScore((atual) => Math.max(0, atual + delta)), 200);
    window.setTimeout(() => setFlip(false), 400);
  }

  function resetar() {
    setFlipA(true);
    setFlipB(true);
    window.setTimeout(() => {
      setScoreA(0);
      setScoreB(0);
    }, 200);
    window.setTimeout(() => {
      setFlipA(false);
      setFlipB(false);
    }, 400);
  }

  const preset = PLACAR_PRESETS[presetId];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-soft">
          Ao vivo
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
          Placar
        </h1>
      </div>

      <div
        className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden rounded-2xl p-6 sm:p-10"
        style={{ background: preset.bodyBg }}
      >
        <ColorPicker selected={presetId} onSelect={selecionarCor} />

        <div
          className="flex w-full max-w-3xl flex-wrap justify-center gap-10 rounded-[20px] p-8 sm:gap-16 sm:p-12"
          style={{
            background: preset.boardBg,
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          }}
        >
          <TeamScore
            nome="TIME A"
            valor={scoreA}
            flip={flipA}
            preset={preset}
            onIncrementar={() => alterar("A", 1)}
            onDecrementar={() => alterar("A", -1)}
          />
          <TeamScore
            nome="TIME B"
            valor={scoreB}
            flip={flipB}
            preset={preset}
            onIncrementar={() => alterar("B", 1)}
            onDecrementar={() => alterar("B", -1)}
          />
        </div>

        <button
          onClick={resetar}
          className="mt-10 rounded-xl px-6 py-3 text-base font-bold text-white transition-transform hover:scale-105"
          style={{ background: preset.resetBg }}
          onMouseEnter={(e) => (e.currentTarget.style.background = preset.resetHoverBg)}
          onMouseLeave={(e) => (e.currentTarget.style.background = preset.resetBg)}
        >
          Resetar placar
        </button>
      </div>
    </div>
  );
}
