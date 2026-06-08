import { useEffect, useState } from "react";

import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";

import { criarAluno, atualizarAluno } from "../services/alunos.service";

import { listarPlanos } from "../services/planos.service";

import "./AlunoModal.css";

export default function AlunoModal({ open, aluno, onClose, onSaved }) {
  const [nome, setNome] = useState("");
  const [turma, setTurma] = useState("A");
  const [planoId, setPlanoId] = useState("");
  const [inativo, setInativo] = useState(false);
  const [erro, setErro] = useState("");

  const [planos, setPlanos] = useState([]);

  useEffect(() => {
    carregarPlanos();
  }, []);

  useEffect(() => {
    if (!open) return;

    if (aluno) {
      setNome(aluno.nome);
      setTurma(aluno.turma);
      setInativo(aluno.inativo);
      setPlanoId(String(aluno.plano_id));
    } else {
      setNome("");
      setTurma("A");

      if (planos.length) {
        setPlanoId(planos[0].id);
      }
    }
  }, [aluno, open, planos]);

  async function carregarPlanos() {
    const data = await listarPlanos();

    setPlanos(data);

    if (!planoId && data.length) {
      setPlanoId(data[0].id);
    }
  }

  async function salvar() {
    if (!nome.trim()) {
      setErro("Informe o nome do aluno");

      return;
    }

    setErro("");
    const payload = {
      nome,
      turma,
      inativo,
      plano_id: planoId,
    };

    if (aluno) {
      await atualizarAluno(aluno.id, payload);
    } else {
      await criarAluno(payload);
    }

    await onSaved();

    onClose();
  }

  return (
    <Modal
      open={open}
      title={aluno ? "Editar Aluno" : "Novo Aluno"}
      onClose={onClose}
      footer={
        <>
          {erro && <div className="form-error">{erro}</div>}

          <Button onClick={onClose}>Cancelar</Button>

          <Button onClick={salvar}>Salvar</Button>
        </>
      }
    >
      <div className="form">
        <div className="form-group">
          <label>Nome</label>

          <input value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Turma</label>

            <select value={turma} onChange={(e) => setTurma(e.target.value)}>
              <option value="A">Turma A</option>

              <option value="B">Turma B</option>
            </select>
          </div>

          <div className="form-group">
            <label>Plano</label>

            <select
              value={planoId}
              onChange={(e) => setPlanoId(e.target.value)}
            >
              {planos.map((plano) => (
                <option key={plano.id} value={String(plano.id)}>
                  {plano.nome} • R$ {plano.valor_total}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={inativo}
                onChange={(e) => setInativo(e.target.checked)}
              />
              Inativo
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
