import { pool } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { normalizeMes, currentMonthFallback } from "@/lib/pagamentos";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const mesParam = searchParams.get("mes") ?? currentMonthFallback();
  const mes = normalizeMes(mesParam);

  try {
    const { rows } = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE a.inativo = false)::int AS alunos_ativos,
         COALESCE(SUM(pl.valor_total), 0) AS receita_prevista,
         COALESCE(SUM(CASE WHEN p.pago = true THEN pl.valor_total ELSE 0 END), 0) AS receita_recebida,
         COALESCE(SUM(CASE WHEN p.pago = true THEN pl.valor_quadra ELSE 0 END), 0) AS custo_quadra,
         COALESCE(SUM(pl.valor_quadra), 0) AS custo_quadra_estimado,
         COALESCE(SUM(CASE WHEN p.pago = true THEN (pl.valor_total - pl.valor_quadra) ELSE 0 END), 0) AS receita_liquida,
         COALESCE(SUM(CASE WHEN COALESCE(p.pago, false) = false THEN pl.valor_total ELSE 0 END), 0) AS valor_a_receber,
         COUNT(*) FILTER (WHERE COALESCE(p.pago, false) = false AND a.inativo = false AND pl.valor_total > 0)::int AS inadimplentes
       FROM public.alunos a
       INNER JOIN public.planos pl ON pl.id = a.plano_id
       LEFT JOIN public.pagamentos p ON p.aluno_id = a.id AND p.mes = $1
       WHERE a.inativo = false`,
      [mes],
    );
    return Response.json(rows[0]);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
