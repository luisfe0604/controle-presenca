import { pool } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    await pool.query(`UPDATE public.alunos SET inativo = true WHERE id = $1`, [id]);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
