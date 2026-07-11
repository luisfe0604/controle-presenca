"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Aluno, PresencaLinha, Turma } from "@/lib/types";
import { api } from "@/lib/api";
import { todayISO } from "@/lib/format";

const TURMAS: (Turma | "todas")[] = ["todas", "A", "B"];

interface SorteioResposta {
  sorteados: string[];
  reiniciouCiclo: boolean;
}

export default function SorteadorPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [presentesIds, setPresentesIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quantidade, setQuantidade] = useState(1);
  const [filtroTurma, setFiltroTurma] = useState<Turma | "todas">("todas");
  const [entrePresentes, setEntrePresentes] = useState(true);
  const [considerarPesos, setConsiderarPesos] = useState(true);
  const [data, setData] = useState(todayISO());

  const [sorteados, setSorteados] = useState<Aluno[] | null>(null);
  const [reiniciou, setReiniciou] = useState(false);
  const [sorteando, setSorteando] = useState(false);

  // Alunos ativos.
  const carregarAlunos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Aluno[]>("/api/alunos?inativo=false");
      setAlunos(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarAlunos();
  }, [carregarAlunos]);

  // Presentes do dia (só quando a opção está ativa).
  const carregarPresentes = useCallback(async () => {
    if (!entrePresentes) return;
    try {
      const rows = await api.get<PresencaLinha[]>(`/api/presenca/data/${data}`);
      setPresentesIds(new Set(rows.filter((r) => r.presente).map((r) => r.aluno_id)));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [entrePresentes, data]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarPresentes();
  }, [carregarPresentes]);

  const elegiveis = useMemo(() => {
    return alunos.filter((a) => {
      if (filtroTurma !== "todas" && a.turma !== filtroTurma) return false;
      if (entrePresentes && !presentesIds.has(a.id)) return false;
      return true;
    });
  }, [alunos, filtroTurma, entrePresentes, presentesIds]);

  async function sortear() {
    setError(null);
    setReiniciou(false);
    setSorteando(true);
    try {
      const resp = await api.post<SorteioResposta>("/api/sorteio", {
        eligibleIds: elegiveis.map((a) => a.id),
        quantidade,
        considerarPesos,
      });
      const byId = new Map(alunos.map((a) => [a.id, a]));
      setSorteados(
        resp.sorteados.map((id) => byId.get(id)).filter((a): a is Aluno => !!a),
      );
      setReiniciou(resp.reiniciouCiclo);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSorteando(false);
    }
  }

  async function reiniciarHistorico() {
    if (!confirm("Reiniciar o histórico de sorteios? Todos poderão ser sorteados novamente.")) {
      return;
    }
    try {
      await api.delete("/api/sorteio");
      setSorteados(null);
      setReiniciou(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const maxQtd = Math.max(1, elegiveis.length);

  const clampQtd = (v: number) =>
    Number.isNaN(v) ? 1 : Math.min(maxQtd, Math.max(1, v));
  const ajustarQtd = (delta: number) => setQuantidade((q) => clampQtd(q + delta));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-soft">
          Quem joga primeiro?
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
          Sorteador
        </h1>
      </div>

      {error && <p className="text-sm text-flare">{error}</p>}

      <div className="space-y-5 rounded-xl border border-line bg-paper p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink">Quantidade</label>
            <div className="flex items-stretch overflow-hidden rounded-lg border border-line">
              <button
                type="button"
                onClick={() => ajustarQtd(-1)}
                disabled={quantidade <= 1}
                aria-label="Diminuir"
                className="px-3 text-lg font-semibold text-ink-soft transition-colors hover:bg-mist disabled:opacity-40"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={maxQtd}
                value={quantidade}
                onChange={(e) => setQuantidade(clampQtd(Number(e.target.value)))}
                className="w-12 border-x border-line bg-paper py-2 text-center text-sm text-ink outline-none focus:border-court [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => ajustarQtd(1)}
                disabled={quantidade >= maxQtd}
                aria-label="Aumentar"
                className="px-3 text-lg font-semibold text-ink-soft transition-colors hover:bg-mist disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink">Turma</label>
            <div className="inline-flex rounded-lg border border-line p-1">
              {TURMAS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFiltroTurma(t)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    filtroTurma === t
                      ? "bg-ink text-chalk"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {t === "todas" ? "Todas" : t}
                </button>
              ))}
            </div>
          </div>

          {entrePresentes && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Dia</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-court"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={entrePresentes}
              onChange={(e) => setEntrePresentes(e.target.checked)}
              className="accent-court"
            />
            Sortear apenas entre os presentes no dia
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={considerarPesos}
              onChange={(e) => setConsiderarPesos(e.target.checked)}
              className="accent-court"
            />
            Considerar pesos (não repetir até todos serem sorteados)
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <button
            onClick={sortear}
            disabled={sorteando || loading || elegiveis.length === 0}
            className="rounded-lg bg-court px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-court-deep disabled:opacity-50"
          >
            {sorteando ? "Sorteando..." : "Sortear"}
          </button>
          <span className="text-sm text-ink-soft">
            {elegiveis.length} aluno{elegiveis.length === 1 ? "" : "s"} elegíve
            {elegiveis.length === 1 ? "l" : "is"}
          </span>
          {considerarPesos && (
            <button
              onClick={reiniciarHistorico}
              className="ml-auto text-sm font-medium text-ink-soft underline-offset-2 hover:text-flare hover:underline"
            >
              Reiniciar histórico
            </button>
          )}
        </div>
      </div>

      {sorteados && (
        <div className="space-y-3">
          {reiniciou && (
            <p className="text-sm text-court-deep">
              Todos já haviam sido sorteados — o ciclo recomeçou.
            </p>
          )}
          {sorteados.length === 0 ? (
            <p className="text-sm text-ink-soft">Ninguém elegível para sortear.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sorteados.map((a, i) => (
                <div
                  key={a.id}
                  className="flex items-center gap-4 rounded-xl bg-ink p-5 text-chalk"
                >
                  <span className="tabular text-3xl font-black text-court">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{a.nome}</p>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-chalk/50">
                      Turma {a.turma}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
