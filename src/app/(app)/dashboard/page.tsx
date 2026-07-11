"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardResumo } from "@/lib/types";
import { api } from "@/lib/api";
import { formatBRL, currentMonth } from "@/lib/format";
import { calcularLiquidos, CUSTO_FIXO_LABEL, CUSTO_FIXO_MENSAL } from "@/lib/config";

export default function DashboardPage() {
  const [mes, setMes] = useState(currentMonth());
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<DashboardResumo>(`/api/dashboard?mes=${mes}`);
      setResumo(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [mes]);

  useEffect(() => {
    // Busca de dados ao montar e quando os filtros mudam (sincronização com a API).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  const liquidos = resumo ? calcularLiquidos(resumo) : null;

  const financeiro =
    resumo && liquidos
      ? [
          { label: "Receita prevista", value: formatBRL(resumo.receita_prevista) },
          { label: "Receita recebida", value: formatBRL(resumo.receita_recebida) },
          {
            label: "A receber",
            value: formatBRL(resumo.valor_a_receber),
            alert: resumo.valor_a_receber > 0,
          },
          {
            label: "Receita líquida",
            value: formatBRL(liquidos.receitaLiquida),
          },
          {
            label: "Receita líquida prevista",
            value: formatBRL(liquidos.receitaLiquidaPrevista),
          },
          {
            label: "Líquido a receber",
            value: formatBRL(liquidos.liquidoAReceber),
            alert: liquidos.liquidoAReceber > 0,
          },
          { label: "Custo de quadra", value: formatBRL(resumo.custo_quadra) },
          {
            label: "Custo de quadra estimado",
            value: formatBRL(resumo.custo_quadra_estimado),
          },
          {
            label: `Custo fixo (${CUSTO_FIXO_LABEL})`,
            value: formatBRL(CUSTO_FIXO_MENSAL),
          },
        ]
      : [];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-soft">
            Placar do mês
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            Visão geral
          </h1>
        </div>
        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-court"
        />
      </div>

      {error && <p className="text-sm text-flare">{error}</p>}

      {loading || !resumo ? (
        <p className="text-sm text-ink-soft">Carregando...</p>
      ) : (
        <>
          {/* Placar principal — o número que importa no dia a dia */}
          <div className="grid grid-cols-2 overflow-hidden rounded-2xl bg-ink text-chalk">
            <div className="p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-chalk/50">
                Alunos ativos
              </p>
              <p className="tabular mt-3 text-6xl font-black leading-none">
                {resumo.alunos_ativos}
              </p>
            </div>
            <div className="border-l border-white/10 p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-chalk/50">
                Inadimplentes
              </p>
              <p
                className={`tabular mt-3 text-6xl font-black leading-none ${
                  resumo.inadimplentes > 0 ? "text-flare" : "text-chalk"
                }`}
              >
                {resumo.inadimplentes}
              </p>
            </div>
          </div>

          {/* Leituras financeiras — quietas */}
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {financeiro.map((m) => (
              <div key={m.label} className="bg-paper p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">
                  {m.label}
                </p>
                <p
                  className={`tabular mt-2 text-2xl font-extrabold ${
                    m.alert ? "text-flare" : "text-ink"
                  }`}
                >
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
