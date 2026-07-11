import { pool } from "@/lib/db";

// Normaliza "YYYY-MM" ou "YYYY-MM-DD" para o primeiro dia do mês (YYYY-MM-01).
export function normalizeMes(mes: string): string {
  return `${mes.slice(0, 7)}-01`;
}

// Mês atual no formato YYYY-MM (fallback quando não informado).
export function currentMonthFallback(): string {
  return new Date().toISOString().slice(0, 7);
}

// Gera registros de pagamento para todos os alunos ativos com plano pago,
// de forma idempotente (ON CONFLICT DO NOTHING). Retorna quantos foram criados.
export async function fecharMes(mesRaw: string): Promise<number> {
  const mes = normalizeMes(mesRaw);
  const { rowCount } = await pool.query(
    `INSERT INTO public.pagamentos (aluno_id, mes, pago, valor_cobrado, valor_quadra)
     SELECT a.id, $1, false, pl.valor_total, pl.valor_quadra
     FROM public.alunos a
     INNER JOIN public.planos pl ON pl.id = a.plano_id
     WHERE a.inativo = false AND pl.valor_total > 0
     ON CONFLICT (aluno_id, mes) DO NOTHING`,
    [mes],
  );
  return rowCount ?? 0;
}
