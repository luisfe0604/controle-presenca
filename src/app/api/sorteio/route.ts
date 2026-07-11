import { pool } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";

export const runtime = "nodejs";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface SorteioBody {
  eligibleIds: string[];
  quantidade: number;
  considerarPesos: boolean;
}

export async function POST(request: Request) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  try {
    const { eligibleIds, quantidade, considerarPesos } =
      (await request.json()) as SorteioBody;

    const eligible = [...new Set(eligibleIds ?? [])];
    const n = Math.max(0, Math.min(quantidade ?? 0, eligible.length));

    if (n === 0) {
      return Response.json({ sorteados: [], reiniciouCiclo: false });
    }

    // Sem pesos: puramente aleatório, sem tocar no histórico.
    if (!considerarPesos) {
      const sorteados = shuffle(eligible).slice(0, n);
      return Response.json({ sorteados, reiniciouCiclo: false });
    }

    // Com pesos: prioriza quem ainda não foi sorteado no ciclo atual.
    const markedRows = await pool.query<{ aluno_id: string }>(
      `SELECT aluno_id FROM public.sorteio_marcacoes WHERE aluno_id = ANY($1)`,
      [eligible],
    );
    const marked = new Set(markedRows.rows.map((r) => r.aluno_id));

    const result: string[] = [];
    const naoSorteados = shuffle(eligible.filter((id) => !marked.has(id)));
    while (result.length < n && naoSorteados.length > 0) {
      result.push(naoSorteados.pop()!);
    }

    // Se esgotou os não-sorteados, reinicia o ciclo (sem repetir neste sorteio).
    let reiniciouCiclo = false;
    if (result.length < n) {
      reiniciouCiclo = true;
      const restante = shuffle(eligible.filter((id) => !result.includes(id)));
      while (result.length < n && restante.length > 0) {
        result.push(restante.pop()!);
      }
    }

    // Persiste as marcações. Se reiniciou, limpa o ciclo do pool antes.
    if (reiniciouCiclo) {
      await pool.query(
        `DELETE FROM public.sorteio_marcacoes WHERE aluno_id = ANY($1)`,
        [eligible],
      );
    }
    await pool.query(
      `INSERT INTO public.sorteio_marcacoes (aluno_id)
       SELECT unnest($1::uuid[])
       ON CONFLICT (aluno_id) DO UPDATE SET sorteado_em = now()`,
      [result],
    );

    return Response.json({ sorteados: result, reiniciouCiclo });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}

// Reinicia todo o histórico de marcações.
export async function DELETE() {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  try {
    await pool.query(`DELETE FROM public.sorteio_marcacoes`);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
