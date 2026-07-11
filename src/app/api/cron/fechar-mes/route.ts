import { fecharMes, currentMonthFallback } from "@/lib/pagamentos";

export const runtime = "nodejs";

// Executado pelo Vercel Cron (ver vercel.json). Gera os pagamentos do mês
// atual automaticamente, substituindo o node-cron do backend antigo.
// Protegido pelo header Authorization: Bearer <CRON_SECRET>.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const mes = currentMonthFallback();
    const registrosCriados = await fecharMes(mes);
    return Response.json({ success: true, mes, registrosCriados });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
