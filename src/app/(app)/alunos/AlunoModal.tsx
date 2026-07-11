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

const inputClass =
  "w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-court";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl border border-line bg-paper p-6 shadow-xl"
      >
        <h2 className="font-display text-xl font-extrabold tracking-tight text-ink">
          {aluno ? "Editar aluno" : "Novo aluno"}
        </h2>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink">Nome</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink">Turma</label>
            <select
              value={turma}
              onChange={(e) => setTurma(e.target.value as Turma)}
              className={inputClass}
            >
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink">Plano</label>
            <select
              value={planoId}
              onChange={(e) => setPlanoId(e.target.value)}
              className={inputClass}
            >
              {planos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {aluno && (
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={inativo}
              onChange={(e) => setInativo(e.target.checked)}
              className="accent-court"
            />
            Aluno inativo
          </label>
        )}

        {error && <p className="text-sm text-flare">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-mist"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-court px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-court-deep disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
