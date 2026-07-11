"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardResumo } from "@/lib/types";
import { api } from "@/lib/api";
import { formatBRL, currentMonth } from "@/lib/format";

interface Metric {
  label: string;
  value: string;
  hint?: string;
}

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
    carregar();
  }, [carregar]);

  const metrics: Metric[] = resumo
    ? [
        { label: "Alunos ativos", value: String(resumo.alunos_ativos) },
        { label: "Inadimplentes", value: String(resumo.inadimplentes) },
        { label: "Receita prevista", value: formatBRL(resumo.receita_prevista) },
        { label: "Receita recebida", value: formatBRL(resumo.receita_recebida) },
        { label: "Valor a receber", value: formatBRL(resumo.valor_a_receber) },
        {
          label: "Receita líquida",
          value: formatBRL(resumo.receita_liquida),
          hint: "Recebido menos custo de quadra",
        },
        { label: "Custo de quadra", value: formatBRL(resumo.custo_quadra) },
        {
          label: "Custo de quadra estimado",
          value: formatBRL(resumo.custo_quadra_estimado),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-neutral-500">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-neutral-200 bg-white p-5"
            >
              <p className="text-sm text-neutral-500">{m.label}</p>
              <p className="mt-2 text-2xl font-semibold text-neutral-900">
                {m.value}
              </p>
              {m.hint && <p className="mt-1 text-xs text-neutral-400">{m.hint}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
