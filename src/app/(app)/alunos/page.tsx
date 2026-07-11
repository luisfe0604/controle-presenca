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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Alunos</h1>
        <button
          onClick={abrirNovo}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          Novo aluno
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-600">
        <input
          type="checkbox"
          checked={mostrarInativos}
          onChange={(e) => setMostrarInativos(e.target.checked)}
        />
        Mostrar inativos
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
                <th className="px-4 py-3 font-medium">Mensalidade</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {visiveis.map((aluno) => (
                <tr
                  key={aluno.id}
                  onClick={() => abrirEdicao(aluno)}
                  className="cursor-pointer hover:bg-neutral-50"
                >
                  <td className="px-4 py-3 text-neutral-900">{aluno.nome}</td>
                  <td className="px-4 py-3 text-neutral-600">{aluno.turma}</td>
                  <td className="px-4 py-3 text-neutral-600">{aluno.plano}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {formatBRL(aluno.valor_total)}
                  </td>
                  <td className="px-4 py-3">
                    {aluno.inativo ? (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                        Inativo
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        Ativo
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {visiveis.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                    Nenhum aluno cadastrado.
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
