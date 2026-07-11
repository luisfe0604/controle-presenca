import { requireUser } from "@/lib/api-auth";
import { fecharMes, normalizeMes } from "@/lib/pagamentos";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  try {
    const { mes } = await request.json();
    const registrosCriados = await fecharMes(mes);
    return Response.json({
      success: true,
      registrosCriados,
      mes: normalizeMes(mes),
    });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
