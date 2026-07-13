export interface PlacarPreset {
  id: string;
  label: string;
  swatch: string;
  bodyBg: string;
  boardBg: string;
  scoreBg: string;
  scoreShadow: string;
  btnBg: string;
  btnHoverBg: string;
  resetBg: string;
  resetHoverBg: string;
}

// "Rosa" replica exatamente as cores do placar original (score-pink.vercel.app).
// As demais são variações de matiz sobre a mesma estrutura visual.
export const PLACAR_PRESETS: Record<string, PlacarPreset> = {
  rosa: {
    id: "rosa",
    label: "Rosa (original)",
    swatch: "#ff4d88",
    bodyBg: "linear-gradient(135deg, #ff9a9e, #fbc2eb, #a18cd1)",
    boardBg: "rgba(255, 105, 180, 0.15)",
    scoreBg: "linear-gradient(145deg, #ff4d88, #c94b7c)",
    scoreShadow: "rgba(255, 77, 136, 0.4)",
    btnBg: "linear-gradient(135deg, #ff4d88, #ff7eb3)",
    btnHoverBg: "linear-gradient(135deg, #ff2e6f, #ff5fa2)",
    resetBg: "linear-gradient(135deg, #ff2e6f, #c94b7c)",
    resetHoverBg: "linear-gradient(135deg, #e6005c, #a83265)",
  },
  quadra: {
    id: "quadra",
    label: "Quadra",
    swatch: "#14b8a6",
    bodyBg: "linear-gradient(135deg, #5eead4, #14b8a6, #0f766e)",
    boardBg: "rgba(14, 138, 134, 0.18)",
    scoreBg: "linear-gradient(145deg, #14b8a6, #0b6b68)",
    scoreShadow: "rgba(20, 184, 166, 0.4)",
    btnBg: "linear-gradient(135deg, #14b8a6, #5eead4)",
    btnHoverBg: "linear-gradient(135deg, #0d9488, #2dd4bf)",
    resetBg: "linear-gradient(135deg, #0f766e, #0b6b68)",
    resetHoverBg: "linear-gradient(135deg, #115e59, #083f3c)",
  },
  laranja: {
    id: "laranja",
    label: "Laranja",
    swatch: "#f97316",
    bodyBg: "linear-gradient(135deg, #fed7aa, #fb923c, #ea580c)",
    boardBg: "rgba(251, 146, 60, 0.18)",
    scoreBg: "linear-gradient(145deg, #f97316, #c2410c)",
    scoreShadow: "rgba(249, 115, 22, 0.4)",
    btnBg: "linear-gradient(135deg, #f97316, #fdba74)",
    btnHoverBg: "linear-gradient(135deg, #ea580c, #fb923c)",
    resetBg: "linear-gradient(135deg, #c2410c, #9a3412)",
    resetHoverBg: "linear-gradient(135deg, #9a3412, #7c2d12)",
  },
  roxo: {
    id: "roxo",
    label: "Roxo",
    swatch: "#8b5cf6",
    bodyBg: "linear-gradient(135deg, #ddd6fe, #a78bfa, #6d28d9)",
    boardBg: "rgba(139, 92, 246, 0.18)",
    scoreBg: "linear-gradient(145deg, #8b5cf6, #6d28d9)",
    scoreShadow: "rgba(139, 92, 246, 0.4)",
    btnBg: "linear-gradient(135deg, #8b5cf6, #c4b5fd)",
    btnHoverBg: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    resetBg: "linear-gradient(135deg, #6d28d9, #5b21b6)",
    resetHoverBg: "linear-gradient(135deg, #5b21b6, #4c1d95)",
  },
  azul: {
    id: "azul",
    label: "Azul",
    swatch: "#3b82f6",
    bodyBg: "linear-gradient(135deg, #93c5fd, #3b82f6, #1d4ed8)",
    boardBg: "rgba(59, 130, 246, 0.18)",
    scoreBg: "linear-gradient(145deg, #3b82f6, #1e40af)",
    scoreShadow: "rgba(59, 130, 246, 0.4)",
    btnBg: "linear-gradient(135deg, #3b82f6, #93c5fd)",
    btnHoverBg: "linear-gradient(135deg, #2563eb, #60a5fa)",
    resetBg: "linear-gradient(135deg, #1e40af, #1e3a8a)",
    resetHoverBg: "linear-gradient(135deg, #1e3a8a, #172554)",
  },
  verde: {
    id: "verde",
    label: "Verde",
    swatch: "#10b981",
    bodyBg: "linear-gradient(135deg, #6ee7b7, #10b981, #047857)",
    boardBg: "rgba(16, 185, 129, 0.18)",
    scoreBg: "linear-gradient(145deg, #10b981, #047857)",
    scoreShadow: "rgba(16, 185, 129, 0.4)",
    btnBg: "linear-gradient(135deg, #10b981, #6ee7b7)",
    btnHoverBg: "linear-gradient(135deg, #059669, #34d399)",
    resetBg: "linear-gradient(135deg, #047857, #065f46)",
    resetHoverBg: "linear-gradient(135deg, #065f46, #064e3b)",
  },
};

export const DEFAULT_PLACAR_PRESET = "rosa";
export const PLACAR_COR_STORAGE_KEY = "placar-cor";
