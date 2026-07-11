import { pool } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { registrarPresenca } from "@/lib/presenca";

export const runtime = "nodejs";

export async function GET() {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.data, p.presente, a.id AS aluno_id, a.nome, a.turma
       FROM public.presenca p
       INNER JOIN public.alunos a ON a.id = p.aluno_id
       ORDER BY p.data DESC`,
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
    const { aluno_id, data, presente } = await request.json();
    const row = await registrarPresenca(aluno_id, data, presente);
    return Response.json(row, { status: 201 });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
