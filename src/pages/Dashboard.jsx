import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";

import Card from "../components/ui/Card";

import { obterDashboard } from "../services/dashboard.service";

import "./Dashboard.css";

export default function Dashboard() {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const data = await obterDashboard();

    setDados(data);
  }

  return (
    <PageContainer title="Dashboard">
      <div className="dashboard-grid">
        <Card>
          <h3>Alunos Ativos</h3>

          <strong>{dados?.alunos_ativos ?? 0}</strong>
        </Card>

        <Card>
          <h3>Receita Prevista</h3>

          <strong>R$ {dados?.receita_prevista ?? 0}</strong>
        </Card>

        <Card>
          <h3>Receita Recebida</h3>

          <strong>R$ {dados?.receita_recebida ?? 0}</strong>
        </Card>

        <Card>
          <h3>Inadimplentes</h3>

          <strong>{dados?.inadimplentes ?? 0}</strong>
        </Card>
        <Card>
          <h3>Receita Líquida Prevista</h3>

          <strong>
            {dados?.receita_prevista - dash?.custo_quadra_estimado - 100}
          </strong>
        </Card>
        <Card>
          <h3>Receita Líquida</h3>

          <strong>R$ {(dados?.receita_liquida ?? 0) - 100}</strong>
        </Card>
        <Card>
          <h3>A Receber</h3>

          <strong>R$ {dados?.valor_a_receber ?? 0}</strong>
        </Card>
        <Card>
          <h3>Líquido A Receber</h3>

          <strong>
            R${" "}
            {dados?.receita_prevista -
              dados?.custo_quadra_estimado -
              100 -
              (dados?.receita_liquida - 100)}
          </strong>
        </Card>
        <Card>
          <h3>Custo Quadra</h3>

          <strong>R$ {dados?.custo_quadra}</strong>
        </Card>
        <Card>
          <h3>Custo Quadra Previsto</h3>

          <strong>R$ {dados?.custo_quadra_estimado}</strong>
        </Card>
        <Card>
          <h3>Sofia</h3>

          <strong>R$ {100.0}</strong>
        </Card>
      </div>
    </PageContainer>
  );
}
