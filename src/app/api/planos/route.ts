import { pool } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";

export const runtime = "nodejs";

export async function GET() {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  try {
    const { rows } = await pool.query(
      `SELECT id, nome, valor_total, valor_quadra
       FROM public.planos
       ORDER BY valor_total DESC`,
    );
    return Response.json(rows);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
