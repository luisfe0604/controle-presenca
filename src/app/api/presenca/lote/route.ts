import { requireUser } from "@/lib/api-auth";
import { registrarPresenca } from "@/lib/presenca";

export const runtime = "nodejs";

interface ItemLote {
  aluno_id: string;
  presente: boolean;
}

export async function POST(request: Request) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  try {
    const { data, presencas } = (await request.json()) as {
      data: string;
      presencas: ItemLote[];
    };

    for (const item of presencas) {
      await registrarPresenca(item.aluno_id, data, item.presente);
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
