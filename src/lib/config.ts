// Custo fixo mensal (rótulo "Sofia" no sistema antigo), subtraído dos
// valores líquidos no dashboard e em pagamentos. Centralizado aqui para
// facilitar alteração — no futuro pode virar configurável por env/banco.
export const CUSTO_FIXO_MENSAL = 100;
export const CUSTO_FIXO_LABEL = "Sofia";

export interface ResumoFinanceiro {
  receita_prevista: number;
  receita_recebida: number;
  valor_a_receber: number;
  custo_quadra: number;
  custo_quadra_estimado: number;
  receita_liquida: number;
}

// Deriva os valores líquidos (já descontando o custo fixo mensal) a partir
// dos totais brutos. Usado no Dashboard e em Pagamentos para manter as
// mesmas fórmulas do sistema antigo.
export function calcularLiquidos(r: ResumoFinanceiro) {
  const receitaLiquida = r.receita_liquida - CUSTO_FIXO_MENSAL;
  const receitaLiquidaPrevista =
    r.receita_prevista - r.custo_quadra_estimado - CUSTO_FIXO_MENSAL;
  const liquidoAReceber = receitaLiquidaPrevista - receitaLiquida;
  return { receitaLiquida, receitaLiquidaPrevista, liquidoAReceber };
}
