import { pool } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ data: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { data } = await params;

  try {
    const { rows } = await pool.query(
      `SELECT
         a.id AS aluno_id, a.nome, a.turma, a.inativo,
         p.id, p.data, COALESCE(p.presente, false) AS presente
       FROM public.alunos a
       LEFT JOIN public.presenca p
         ON p.aluno_id = a.id AND p.data = $1
       WHERE a.inativo = false
       ORDER BY a.nome`,
      [data],
    );
    return Response.json(rows);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
