"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PagamentoLinha } from "@/lib/types";
import { api } from "@/lib/api";
import { formatBRL, currentMonth } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { calcularLiquidos, CUSTO_FIXO_LABEL, CUSTO_FIXO_MENSAL } from "@/lib/config";

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
    // Busca de dados ao montar e quando o mês muda (sincronização com a API).
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const custoQuadra = linhas
    .filter((l) => l.pago)
    .reduce((acc, l) => acc + l.valor_quadra, 0);
  const custoQuadraEstimado = linhas.reduce((acc, l) => acc + l.valor_quadra, 0);
  const receitaLiquidaBruta = linhas
    .filter((l) => l.pago)
    .reduce((acc, l) => acc + l.valor_liquido, 0);

  const liquidos = calcularLiquidos({
    receita_prevista: totalPrevisto,
    receita_recebida: totalRecebido,
    valor_a_receber: totalPrevisto - totalRecebido,
    custo_quadra: custoQuadra,
    custo_quadra_estimado: custoQuadraEstimado,
    receita_liquida: receitaLiquidaBruta,
  });

  const inadimplentes = linhas.filter((l) => !l.pago).length;

  const resumoCards = [
    { label: "Recebido", value: formatBRL(totalRecebido), tone: "court" as const },
    { label: "Previsto", value: formatBRL(totalPrevisto), tone: "ink" as const },
    {
      label: "Inadimplentes",
      value: String(inadimplentes),
      tone: inadimplentes > 0 ? ("flare" as const) : ("ink" as const),
    },
    { label: "Líquido", value: formatBRL(liquidos.receitaLiquida), tone: "ink" as const },
    {
      label: "Líquido previsto",
      value: formatBRL(liquidos.receitaLiquidaPrevista),
      tone: "ink" as const,
    },
    {
      label: "A receber líquido",
      value: formatBRL(liquidos.liquidoAReceber),
      tone: "ink" as const,
    },
    { label: "Custo de quadra", value: formatBRL(custoQuadra), tone: "ink" as const },
    {
      label: `Custo fixo (${CUSTO_FIXO_LABEL})`,
      value: formatBRL(CUSTO_FIXO_MENSAL),
      tone: "ink" as const,
    },
  ];

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-soft">
            Mensalidades
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            Pagamentos
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-4">
        {resumoCards.map((c) => (
          <div key={c.label} className="bg-paper p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">
              {c.label}
            </p>
            <p
              className={`tabular mt-1 text-xl font-extrabold ${
                c.tone === "court"
                  ? "text-court-deep"
                  : c.tone === "flare"
                    ? "text-flare"
                    : "text-ink"
              }`}
            >
              {c.value}
            </p>
          </div>
        ))}
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
        <div className="overflow-x-auto rounded-xl border border-line bg-paper">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left">
              <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Turma</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Plano</th>
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
                  <td className="hidden px-4 py-3 text-ink-soft sm:table-cell">
                    {linha.plano}
                  </td>
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
