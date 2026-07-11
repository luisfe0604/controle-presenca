"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PagamentoLinha } from "@/lib/types";
import { api } from "@/lib/api";
import { formatBRL, currentMonth } from "@/lib/format";
import { exportCsv } from "@/lib/csv";

export default function PagamentosPage() {
  const [mes, setMes] = useState(currentMonth());
  const [linhas, setLinhas] = useState<PagamentoLinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [somenteInadimplentes, setSomenteInadimplentes] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await api.get<PagamentoLinha[]>(`/api/pagamentos/mes/${mes}`);
      setLinhas(rows);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [mes]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function togglePago(linha: PagamentoLinha) {
    if (!linha.id) return;
    const novoValor = !linha.pago;
    setSalvando(linha.id);

    setLinhas((prev) =>
      prev.map((l) => (l.id === linha.id ? { ...l, pago: novoValor } : l)),
    );

    try {
      await api.patch(`/api/pagamentos/${linha.id}`, { pago: novoValor });
    } catch (err) {
      setError((err as Error).message);
      setLinhas((prev) =>
        prev.map((l) => (l.id === linha.id ? { ...l, pago: !novoValor } : l)),
      );
    } finally {
      setSalvando(null);
    }
  }

  const visiveis = useMemo(
    () => (somenteInadimplentes ? linhas.filter((l) => !l.pago) : linhas),
    [linhas, somenteInadimplentes],
  );

  const totalRecebido = linhas
    .filter((l) => l.pago)
    .reduce((acc, l) => acc + l.valor_total, 0);
  const totalPrevisto = linhas.reduce((acc, l) => acc + l.valor_total, 0);

  function baixarCsv() {
    exportCsv(
      `pagamentos-${mes}.csv`,
      visiveis.map((l) => ({
        nome: l.nome,
        turma: l.turma,
        plano: l.plano,
        valor: l.valor_total,
        pago: l.pago ? "Sim" : "Não",
      })),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-neutral-900">Pagamentos</h1>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
          <button
            onClick={baixarCsv}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="rounded-lg border border-neutral-200 bg-white px-5 py-3">
          <p className="text-xs text-neutral-500">Recebido</p>
          <p className="text-lg font-semibold text-green-700">
            {formatBRL(totalRecebido)}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white px-5 py-3">
          <p className="text-xs text-neutral-500">Previsto</p>
          <p className="text-lg font-semibold text-neutral-900">
            {formatBRL(totalPrevisto)}
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-600">
        <input
          type="checkbox"
          checked={somenteInadimplentes}
          onChange={(e) => setSomenteInadimplentes(e.target.checked)}
        />
        Mostrar apenas inadimplentes
      </label>

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
                <th className="px-4 py-3 font-medium">Plano</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 text-right font-medium">Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {visiveis.map((linha) => (
                <tr key={linha.aluno_id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-900">{linha.nome}</td>
                  <td className="px-4 py-3 text-neutral-600">{linha.turma}</td>
                  <td className="px-4 py-3 text-neutral-600">{linha.plano}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {formatBRL(linha.valor_total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="checkbox"
                      checked={!!linha.pago}
                      disabled={!linha.id || salvando === linha.id}
                      onChange={() => togglePago(linha)}
                      className="h-5 w-5 cursor-pointer accent-green-600"
                    />
                  </td>
                </tr>
              ))}
              {visiveis.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                    Nenhum pagamento neste mês.
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
