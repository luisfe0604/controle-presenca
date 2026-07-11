export type Turma = "A" | "B";

// IDs no banco são UUID (string).
export interface Plano {
  id: string;
  nome: string;
  valor_total: number;
  valor_quadra: number;
}

export interface Aluno {
  id: string;
  nome: string;
  turma: Turma;
  inativo: boolean;
  plano_id: string;
  plano: string;
  valor_total: number;
  valor_quadra: number;
  valor_liquido: number;
}

export interface PresencaLinha {
  aluno_id: string;
  nome: string;
  turma: Turma;
  inativo: boolean;
  id: string | null;
  data: string | null;
  presente: boolean;
}

export interface PagamentoLinha {
  id: string | null;
  mes: string | null;
  pago: boolean | null;
  aluno_id: string;
  nome: string;
  turma: Turma;
  inativo: boolean;
  plano_id: string;
  plano: string;
  valor_total: number;
  valor_quadra: number;
  valor_liquido: number;
}

export interface DashboardResumo {
  alunos_ativos: number;
  receita_prevista: number;
  receita_recebida: number;
  custo_quadra: number;
  custo_quadra_estimado: number;
  receita_liquida: number;
  valor_a_receber: number;
  inadimplentes: number;
}
