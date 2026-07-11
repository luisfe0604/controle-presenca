import { pool } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ alunoId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { alunoId } = await params;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM public.presenca WHERE aluno_id = $1 ORDER BY data DESC`,
      [alunoId],
    );
    return Response.json(rows);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
