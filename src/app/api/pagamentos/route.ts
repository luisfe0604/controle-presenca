import { pool } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";

export const runtime = "nodejs";

export async function GET() {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  try {
    const { rows } = await pool.query(
      `SELECT
         pg.id, pg.mes, pg.pago,
         a.id AS aluno_id, a.nome, a.turma, a.inativo,
         pl.id AS plano_id, pl.nome AS plano, pl.valor_total, pl.valor_quadra,
         (pl.valor_total - pl.valor_quadra) AS valor_liquido
       FROM public.alunos a
       INNER JOIN public.planos pl ON pl.id = a.plano_id
       LEFT JOIN public.pagamentos pg ON pg.aluno_id = a.id
       ORDER BY pg.mes DESC NULLS LAST, a.nome`,
    );
    return Response.json(rows);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  try {
    const { aluno_id, mes, pago } = await request.json();
    const { rows } = await pool.query(
      `INSERT INTO public.pagamentos (aluno_id, mes, pago)
       VALUES ($1, $2, $3) RETURNING *`,
      [aluno_id, mes, pago],
    );
    return Response.json(rows[0], { status: 201 });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
