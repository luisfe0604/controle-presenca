import { pool } from "@/lib/db";

// Upsert de presença por (aluno_id, data), replicando a lógica do backend.
export async function registrarPresenca(
  aluno_id: string,
  data: string,
  presente: boolean,
) {
  const existing = await pool.query(
    `SELECT id FROM public.presenca WHERE aluno_id = $1 AND data = $2`,
    [aluno_id, data],
  );

  if (existing.rows.length > 0) {
    const { rows } = await pool.query(
      `UPDATE public.presenca SET presente = $1
       WHERE aluno_id = $2 AND data = $3 RETURNING *`,
      [presente, aluno_id, data],
    );
    return rows[0];
  }

  const { rows } = await pool.query(
    `INSERT INTO public.presenca (aluno_id, data, presente)
     VALUES ($1, $2, $3) RETURNING *`,
    [aluno_id, data, presente],
  );
  return rows[0];
}
