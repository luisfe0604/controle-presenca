"use client";

import { useState } from "react";
import { PLACAR_PRESETS } from "@/lib/placar-colors";

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

function PaletteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.9-.5-1.4 0-1.1.9-2 2-2h2.3c1.8 0 3.2-1.4 3.2-3.2A9.8 9.8 0 0 0 12 2Z" />
      <circle cx="7" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ColorPicker({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute right-3 top-3 z-10 sm:right-5 sm:top-5">
      {open && (
        <button
          aria-label="Fechar seletor de cor"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-10 cursor-default"
        />
      )}

      <div className="relative z-20">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Escolher cor do placar"
          aria-expanded={open}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white/70 backdrop-blur transition-all hover:bg-black/35 hover:text-white"
        >
          <PaletteIcon />
        </button>

        {open && (
          <div className="absolute right-0 top-10 flex gap-2 rounded-xl bg-black/30 p-2.5 backdrop-blur">
            {Object.values(PLACAR_PRESETS).map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  onSelect(preset.id);
                  setOpen(false);
                }}
                aria-label={preset.label}
                title={preset.label}
                className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${
                  selected === preset.id ? "ring-2 ring-white ring-offset-2 ring-offset-black/30" : ""
                }`}
                style={{ background: preset.swatch }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
