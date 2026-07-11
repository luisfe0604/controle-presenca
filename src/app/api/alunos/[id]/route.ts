import { pool } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    const { rows } = await pool.query(
      `SELECT
         a.id, a.nome, a.turma, a.inativo,
         p.id AS plano_id, p.nome AS plano, p.valor_total, p.valor_quadra,
         (p.valor_total - p.valor_quadra) AS valor_liquido
       FROM public.alunos a
       INNER JOIN public.planos p ON p.id = a.plano_id
       WHERE a.id = $1`,
      [id],
    );

    if (rows.length === 0) {
      return Response.json({ error: "Aluno não encontrado" }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    const { nome, turma, inativo, plano_id } = await request.json();

    if (turma !== "A" && turma !== "B") {
      return Response.json({ error: "Turma inválida" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `UPDATE public.alunos
       SET nome = $1, turma = $2, inativo = $3, plano_id = $4
       WHERE id = $5
       RETURNING *`,
      [nome, turma, inativo, plano_id, id],
    );

    if (rows.length === 0) {
      return Response.json({ error: "Aluno não encontrado" }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    await pool.query(`DELETE FROM public.alunos WHERE id = $1`, [id]);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
