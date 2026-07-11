"use client";

import { useCallback, useEffect, useState } from "react";
import type { Aluno, Plano } from "@/lib/types";
import { api } from "@/lib/api";
import { formatBRL } from "@/lib/format";
import { AlunoModal } from "./AlunoModal";

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Aluno | null>(null);
  const [mostrarInativos, setMostrarInativos] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [alunosData, planosData] = await Promise.all([
        api.get<Aluno[]>("/api/alunos"),
        api.get<Plano[]>("/api/planos"),
      ]);
      setAlunos(alunosData);
      setPlanos(planosData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Busca de dados ao montar (sincronização com a API).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  function abrirNovo() {
    setEditing(null);
    setModalOpen(true);
  }

  function abrirEdicao(aluno: Aluno) {
    setEditing(aluno);
    setModalOpen(true);
  }

  function onSaved() {
    setModalOpen(false);
    carregar();
  }

  const visiveis = mostrarInativos ? alunos : alunos.filter((a) => !a.inativo);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-soft">
            Elenco
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            Alunos
          </h1>
        </div>
        <button
          onClick={abrirNovo}
          className="rounded-lg bg-court px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-court-deep"
        >
          Novo aluno
        </button>
      </div>

      <label className="flex w-fit items-center gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={mostrarInativos}
          onChange={(e) => setMostrarInativos(e.target.checked)}
          className="accent-court"
        />
        Mostrar inativos
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
                <th className="px-4 py-3 font-semibold">Plano</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                  Mensalidade
                </th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist">
              {visiveis.map((aluno) => (
                <tr
                  key={aluno.id}
                  onClick={() => abrirEdicao(aluno)}
                  className="cursor-pointer transition-colors hover:bg-chalk"
                >
                  <td className="px-4 py-3 font-medium text-ink">{aluno.nome}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-mist font-display text-xs font-bold text-ink">
                      {aluno.turma}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{aluno.plano}</td>
                  <td className="hidden px-4 py-3 tabular font-semibold text-ink sm:table-cell">
                    {formatBRL(aluno.valor_total)}
                  </td>
                  <td className="px-4 py-3">
                    {aluno.inativo ? (
                      <span className="rounded-full bg-mist px-2 py-0.5 text-xs font-medium text-ink-soft">
                        Inativo
                      </span>
                    ) : (
                      <span className="rounded-full bg-court/10 px-2 py-0.5 text-xs font-medium text-court-deep">
                        Ativo
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {visiveis.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-soft">
                    Nenhum aluno cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <AlunoModal
          aluno={editing}
          planos={planos}
          onClose={() => setModalOpen(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
