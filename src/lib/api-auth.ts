import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      unauthorized: Response.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  return { user, unauthorized: null };
}
