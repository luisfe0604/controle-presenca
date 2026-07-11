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
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-soft">
            Mensalidades
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            Pagamentos
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-court"
          />
          <button
            onClick={baixarCsv}
            className="rounded-lg border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-mist"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-paper">
        <div className="p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">
            Recebido
          </p>
          <p className="tabular mt-1 text-2xl font-extrabold text-court-deep">
            {formatBRL(totalRecebido)}
          </p>
        </div>
        <div className="border-l border-line p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">
            Previsto
          </p>
          <p className="tabular mt-1 text-2xl font-extrabold text-ink">
            {formatBRL(totalPrevisto)}
          </p>
        </div>
      </div>

      <label className="flex w-fit items-center gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={somenteInadimplentes}
          onChange={(e) => setSomenteInadimplentes(e.target.checked)}
          className="accent-court"
        />
        Mostrar apenas inadimplentes
      </label>

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
                <th className="px-4 py-3 font-semibold">Plano</th>
                <th className="px-4 py-3 font-semibold">Valor</th>
                <th className="px-4 py-3 text-right font-semibold">Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist">
              {visiveis.map((linha) => (
                <tr
                  key={linha.aluno_id}
                  className={`transition-colors ${
                    linha.pago ? "bg-court/5" : "hover:bg-chalk"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-ink">{linha.nome}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-mist font-display text-xs font-bold text-ink">
                      {linha.turma}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{linha.plano}</td>
                  <td className="px-4 py-3 tabular font-semibold text-ink">
                    {formatBRL(linha.valor_total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="checkbox"
                      checked={!!linha.pago}
                      disabled={!linha.id || salvando === linha.id}
                      onChange={() => togglePago(linha)}
                      className="h-5 w-5 cursor-pointer accent-court"
                    />
                  </td>
                </tr>
              ))}
              {visiveis.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-soft">
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
