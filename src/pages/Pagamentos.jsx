import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";

import Button from "../components/ui/Button";

import {
  listarPagamentos,
  fecharMes,
  atualizarPagamento,
} from "../services/pagamentos.service";
import { exportToCSV } from "../utils/exportCsv";

import "./Pagamentos.css";

export default function Pagamentos() {
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));

  const [pagamentos, setPagamentos] = useState([]);
  const [filtroTurma, setFiltroTurma] = useState("TODAS");

  useEffect(() => {
    carregar();
  }, [mes]);

  async function carregar() {
    const data = await listarPagamentos(mes);

    setPagamentos(data);
  }

  const pagamentosFiltrados = pagamentos.filter((p) => {
    if (filtroTurma === "TODAS") return true;
    return p.turma === filtroTurma;
  });

  const base = pagamentosFiltrados;

  async function gerarMes() {
    await fecharMes(mes);

    carregar();
  }

  const receitaPrevista = base.reduce(
    (acc, p) => acc + Number(p.valor_total || 0),
    0,
  );

  const receitaRecebida = base.reduce(
    (acc, p) => (p.pago ? acc + Number(p.valor_total || 0) : acc),
    0,
  );

  const valorAReceber = receitaPrevista - receitaRecebida;

  const custoQuadra = base.reduce(
    (acc, p) => (p.pago ? acc + Number(p.valor_quadra || 0) : acc),
    0,
  );

  const receitaLiquida = receitaRecebida - custoQuadra - 100;

  async function alterarStatus(pagamento) {
    await atualizarPagamento(pagamento.id, !pagamento.pago);

    carregar();
  }

  return (
    <PageContainer
      title="Pagamentos"
    //   actions={<Button onClick={gerarMes}>Gerar Mês</Button>}
    >
      <div className="filtros">
        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
        />

        <select
          value={filtroTurma}
          onChange={(e) => setFiltroTurma(e.target.value)}
        >
          <option value="TODAS">Todas as turmas</option>
          <option value="A">Turma A</option>
          <option value="B">Turma B</option>
        </select>
      </div>

      <div className="pagamentos-cards">
        <div className="card-resumo">
          <span>Receita Prevista</span>

          <strong>R$ {receitaPrevista.toFixed(2)}</strong>
        </div>

        <div className="card-resumo">
          <span>Receita Recebida</span>

          <strong>R$ {receitaRecebida.toFixed(2)}</strong>
        </div>

        <div className="card-resumo">
          <span>A Receber</span>

          <strong>R$ {valorAReceber.toFixed(2)}</strong>
        </div>

        <div className="card-resumo">
          <span>Quadra</span>

          <strong>R$ {custoQuadra.toFixed(2)}</strong>
        </div>

        <div className="card-resumo">
          <span>Liquido</span>

          <strong>R$ {receitaLiquida.toFixed(2)}</strong>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Plano</th>
              <th>Valor</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {pagamentosFiltrados.map((pagamento) => (
              <tr
                key={pagamento.id}
                className={`
                ${pagamento.pago ? "pago" : "pendente"}
                ${pagamento.inativo ? "inativo" : ""}
            `}
              >
                <td>{pagamento.nome}</td>

                <td className="col-plano">{pagamento.plano}</td>

                <td>
                  R$
                  {pagamento.valor_total}
                </td>

                <td className="col-pago">{pagamento.pago ? "✅" : "❌"}</td>

                <td>
                  <Button
                    className={`btn-status ${pagamento.pago ? "pago" : "pendente"}`}
                    onClick={() => alterarStatus(pagamento)}
                    disabled={pagamento.inativo}
                    title={
                      pagamento.pago ? "Estornar pagamento" : "Marcar como pago"
                    }
                  >
                    {pagamento.pago ? "↩" : "✓"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        onClick={() =>
          exportToCSV(
            `pagamentos-${mes}.csv`,
            pagamentos.map((p) => ({
              nome: p.nome,
              plano: p.plano,
              valor: p.valor_total,
              pago: p.pago ? "Sim" : "Não",
            })),
          )
        }
      >
        Exportar Pagamentos
      </Button>
    </PageContainer>
  );
}
