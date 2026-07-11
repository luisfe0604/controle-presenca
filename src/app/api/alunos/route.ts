import { pool } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";

export const runtime = "nodejs";

const ALUNO_SELECT = `
  SELECT
    a.id, a.nome, a.turma, a.inativo,
    p.id AS plano_id, p.nome AS plano, p.valor_total, p.valor_quadra,
    (p.valor_total - p.valor_quadra) AS valor_liquido
  FROM public.alunos a
  INNER JOIN public.planos p ON p.id = a.plano_id
`;

export async function GET(request: Request) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const inativo = searchParams.get("inativo");
  const turma = searchParams.get("turma");

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (inativo === "true" || inativo === "false") {
    values.push(inativo === "true");
    conditions.push(`a.inativo = $${values.length}`);
  }
  if (turma === "A" || turma === "B") {
    values.push(turma);
    conditions.push(`a.turma = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const { rows } = await pool.query(
      `${ALUNO_SELECT} ${where} ORDER BY a.nome`,
      values,
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
    const { nome, turma, plano_id } = await request.json();

    if (turma !== "A" && turma !== "B") {
      return Response.json({ error: "Turma inválida" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO public.alunos (nome, turma, plano_id, inativo)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [nome, turma, plano_id],
    );
    return Response.json(rows[0], { status: 201 });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
