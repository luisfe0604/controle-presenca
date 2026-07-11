"use client";

import { useEffect, useState } from "react";
import type { Aluno, Plano, Turma } from "@/lib/types";
import { api } from "@/lib/api";

interface Props {
  aluno: Aluno | null;
  planos: Plano[];
  onClose: () => void;
  onSaved: () => void;
}

export function AlunoModal({ aluno, planos, onClose, onSaved }: Props) {
  const [nome, setNome] = useState(aluno?.nome ?? "");
  const [turma, setTurma] = useState<Turma>(aluno?.turma ?? "A");
  const [planoId, setPlanoId] = useState<string>(
    aluno?.plano_id ?? planos[0]?.id ?? "",
  );
  const [inativo, setInativo] = useState(aluno?.inativo ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (planoId === "" && planos.length > 0) setPlanoId(planos[0].id);
  }, [planos, planoId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (planoId === "") {
      setError("Selecione um plano.");
      return;
    }

    setSaving(true);
    try {
      if (aluno) {
        await api.put(`/api/alunos/${aluno.id}`, {
          nome,
          turma,
          inativo,
          plano_id: planoId,
        });
      } else {
        await api.post(`/api/alunos`, { nome, turma, plano_id: planoId });
      }
      onSaved();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-neutral-900">
          {aluno ? "Editar aluno" : "Novo aluno"}
        </h2>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700">Nome</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700">Turma</label>
          <select
            value={turma}
            onChange={(e) => setTurma(e.target.value as Turma)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          >
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700">Plano</label>
          <select
            value={planoId}
            onChange={(e) => setPlanoId(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          >
            {planos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {aluno && (
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={inativo}
              onChange={(e) => setInativo(e.target.checked)}
            />
            Aluno inativo
          </label>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
