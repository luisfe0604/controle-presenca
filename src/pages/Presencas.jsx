import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";

import { listarPresencas, salvarPresenca } from "../services/presenca.service";
import { exportToCSV } from "../utils/exportCsv";

import "./Presenca.css";

export default function Presencas() {
  const hoje = new Date().toISOString().split("T")[0];

  const [data, setData] = useState(hoje);

  const [alunos, setAlunos] = useState([]);
  const [filtroTurma, setFiltroTurma] = useState("TODAS");

  useEffect(() => {
    carregar();
  }, [data]);

  async function carregar() {
    const response = await listarPresencas(data);

    setAlunos(response);
  }

  async function toggle(aluno) {
    const novoValor = !aluno.presente;

    setAlunos((prev) =>
      prev.map((a) => (a.aluno_id === aluno.aluno_id ? { ...a, presente: novoValor } : a)),
    );

    try {
      await salvarPresenca({
        aluno_id: aluno.aluno_id,
        data,
        presente: novoValor,
      });
    } catch (err) {
      setAlunos((prev) =>
        prev.map((a) =>
          a.aluno_id === aluno.aluno_id ? { ...a, presente: !novoValor } : a,
        ),
      );

      alert("Erro ao salvar presença");
    }
  }

  const turmaA = alunos.filter((a) => a.turma === "A");

  const turmaB = alunos.filter((a) => a.turma === "B");

  const alunosFiltrados = alunos.filter((a) => {
    if (filtroTurma === "TODAS") return true;
    return a.turma === filtroTurma;
  });

  const totalPresentes = alunosFiltrados.filter((a) => a.presente).length;

  return (
    <PageContainer
      title="Presenças"
    >
      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <div className="filtro-turma">
        <label>Turma:</label>

        <select
          value={filtroTurma}
          onChange={(e) => setFiltroTurma(e.target.value)}
        >
          <option value="TODAS">Todas</option>
          <option value="A">Turma A</option>
          <option value="B">Turma B</option>
        </select>
      </div>

      <div className="presenca-resumo">
        <strong>Presentes:</strong> {totalPresentes}
      </div>

      <div className="presenca-list">
        {alunosFiltrados.map((aluno) => (
          <label
            key={aluno.id}
            className={`presenca-item 
                ${aluno.inativo ? "inativo" : ""} 
                ${aluno.presente ? "presente" : ""}
            `}
          >
            <input
              type="checkbox"
              checked={aluno.presente}
              disabled={aluno.inativo}
              onChange={() => toggle(aluno)}
            />

            {aluno.nome}
          </label>
        ))}
      </div>
      <Button
        onClick={() =>
          exportToCSV(
            `presencas-${data}.csv`,
            alunos.map((a) => ({
              nome: a.nome,
              turma: a.turma,
              presente: a.presente ? "Sim" : "Não",
              data,
            })),
          )
        }
      >
        Exportar Presença
      </Button>
    </PageContainer>
  );
}
