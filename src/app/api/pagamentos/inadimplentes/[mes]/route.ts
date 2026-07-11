import { pool } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { normalizeMes } from "@/lib/pagamentos";

export const runtime = "nodejs";

type Params = { params: Promise<{ mes: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { mes } = await params;

  try {
    const { rows } = await pool.query(
      `SELECT
         pg.id, pg.mes,
         a.id AS aluno_id, a.nome, a.turma,
         pl.id AS plano_id, pl.nome AS plano, pl.valor_total, pl.valor_quadra,
         (pl.valor_total - pl.valor_quadra) AS valor_liquido
       FROM public.pagamentos pg
       INNER JOIN public.alunos a ON a.id = pg.aluno_id
       INNER JOIN public.planos pl ON pl.id = a.plano_id
       WHERE pg.mes = $1 AND pg.pago = false AND pl.valor_total > 0
       ORDER BY a.nome`,
      [normalizeMes(mes)],
    );
    return Response.json(rows);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
