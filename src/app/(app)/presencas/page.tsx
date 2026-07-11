"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PresencaLinha, Turma } from "@/lib/types";
import { api } from "@/lib/api";
import { todayISO } from "@/lib/format";

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

    // Atualização otimista.
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
      // Reverte em caso de erro.
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
      <h1 className="text-2xl font-semibold text-neutral-900">Presenças</h1>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700">Turma</label>
          <select
            value={filtroTurma}
            onChange={(e) => setFiltroTurma(e.target.value as Turma | "todas")}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          >
            <option value="todas">Todas</option>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </div>

        <p className="ml-auto text-sm text-neutral-500">
          {presentes} de {visiveis.length} presentes
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-neutral-500">Carregando...</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Turma</th>
                <th className="px-4 py-3 text-right font-medium">Presente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {visiveis.map((linha) => (
                <tr key={linha.aluno_id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-900">{linha.nome}</td>
                  <td className="px-4 py-3 text-neutral-600">{linha.turma}</td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="checkbox"
                      checked={linha.presente}
                      disabled={salvando === linha.aluno_id}
                      onChange={() => togglePresenca(linha)}
                      className="h-5 w-5 cursor-pointer accent-neutral-900"
                    />
                  </td>
                </tr>
              ))}
              {visiveis.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-neutral-400">
                    Nenhum aluno ativo.
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
