import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";

import Button from "../components/ui/Button";

import AlunoModal from "./AlunoModal";

import { listarAlunos } from "../services/alunos.service";

import { exportToCSV } from "../utils/exportCsv";

import "./Alunos.css";

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);

  const [alunoEditando, setAlunoEditando] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const data = await listarAlunos();

    setAlunos(data);
  }

  function novoAluno() {
    setAlunoEditando(null);

    setModalOpen(true);
  }

  function editarAluno(aluno) {
    setAlunoEditando(aluno);

    setModalOpen(true);
  }

  return (
    <>
      <PageContainer
        title="Alunos"
        actions={<Button onClick={novoAluno}>Novo Aluno</Button>}
      >
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Turma</th>
                <th>Plano</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.id}>
                  <td className="col-nome">{aluno.nome}</td>

                  <td className="col-turma">{aluno.turma}</td>

                  <td className="col-plano">{aluno.plano}</td>

                  <td className="col-ativo">
                    {aluno.inativo ? "Inativo" : "Ativo"}
                  </td>

                  <td>
                    <Button onClick={() => editarAluno(aluno)}>Editar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button onClick={() => exportToCSV("alunos.csv", alunos)}>
          Exportar Alunos
        </Button>
      </PageContainer>

      <AlunoModal
        open={modalOpen}
        aluno={alunoEditando}
        onClose={() => setModalOpen(false)}
        onSaved={carregar}
      />
    </>
  );
}
