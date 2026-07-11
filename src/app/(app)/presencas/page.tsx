"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PresencaLinha, Turma } from "@/lib/types";
import { api } from "@/lib/api";
import { todayISO } from "@/lib/format";

const TURMAS: (Turma | "todas")[] = ["todas", "A", "B"];

export default function PresencasPage() {
  const [data, setData] = useState(todayISO());
  const [linhas, setLinhas] = useState<PresencaLinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [filtroTurma, setFiltroTurma] = useState<Turma | "todas">("todas");

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await api.get<PresencaLinha[]>(`/api/presenca/data/${data}`);
      setLinhas(rows);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function togglePresenca(linha: PresencaLinha) {
    const novoValor = !linha.presente;
    setSalvando(linha.aluno_id);

    setLinhas((prev) =>
      prev.map((l) =>
        l.aluno_id === linha.aluno_id ? { ...l, presente: novoValor } : l,
      ),
    );

    try {
      await api.post(`/api/presenca`, {
        aluno_id: linha.aluno_id,
        data,
        presente: novoValor,
      });
    } catch (err) {
      setError((err as Error).message);
      setLinhas((prev) =>
        prev.map((l) =>
          l.aluno_id === linha.aluno_id ? { ...l, presente: !novoValor } : l,
        ),
      );
    } finally {
      setSalvando(null);
    }
  }

  const visiveis = useMemo(
    () =>
      filtroTurma === "todas"
        ? linhas
        : linhas.filter((l) => l.turma === filtroTurma),
    [linhas, filtroTurma],
  );

  const presentes = visiveis.filter((l) => l.presente).length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-soft">
            Chamada do dia
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            Presenças
          </h1>
        </div>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-court"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-lg border border-line bg-paper p-1">
          {TURMAS.map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTurma(t)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                filtroTurma === t
                  ? "bg-ink text-chalk"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {t === "todas" ? "Todas" : `Turma ${t}`}
            </button>
          ))}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="tabular text-2xl font-black text-court">{presentes}</span>
          <span className="text-sm text-ink-soft">
            de {visiveis.length} presentes
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-flare">{error}</p>}
      {loading ? (
        <p className="text-sm text-ink-soft">Carregando...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-paper">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left">
              <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Turma</th>
                <th className="px-4 py-3 text-right font-semibold">Presente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist">
              {visiveis.map((linha) => (
                <tr
                  key={linha.aluno_id}
                  className={`transition-colors ${
                    linha.presente ? "bg-court/5" : "hover:bg-chalk"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-ink">{linha.nome}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-mist font-display text-xs font-bold text-ink">
                      {linha.turma}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="checkbox"
                      checked={linha.presente}
                      disabled={salvando === linha.aluno_id}
                      onChange={() => togglePresenca(linha)}
                      className="h-5 w-5 cursor-pointer accent-court"
                    />
                  </td>
                </tr>
              ))}
              {visiveis.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-ink-soft">
                    Nenhum aluno ativo nesta turma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
