import { pool } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    const { pago } = await request.json();
    const { rows } = await pool.query(
      `UPDATE public.pagamentos SET pago = $1 WHERE id = $2 RETURNING *`,
      [pago, id],
    );

    if (rows.length === 0) {
      return Response.json({ error: "Pagamento não encontrado" }, { status: 404 });
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
    await pool.query(`DELETE FROM public.pagamentos WHERE id = $1`, [id]);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
