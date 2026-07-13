"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logomark } from "@/components/Logomark";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Painel de marca — a quadra */}
      <div className="relative hidden flex-1 flex-col justify-between bg-ink p-12 text-chalk lg:flex">
        <div className="flex items-center gap-3">
          <Logomark size={40} />
          <p className="font-display text-xl font-extrabold tracking-tight">Presença</p>
        </div>

        <div>
          <p className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight">
            Chamada,
            <br />
            turmas e
            <br />
            <span className="text-court">mensalidades.</span>
          </p>
          <p className="mt-6 max-w-sm text-chalk/60">
            A gestão das suas aulas de vôlei em um só lugar. Marque presença,
            acompanhe pagamentos e veja a saúde do mês num relance.
          </p>
        </div>

        <p className="text-[11px] uppercase tracking-[0.18em] text-chalk/40">
          Gestão · Vôlei
        </p>
      </div>

      {/* Formulário */}
      <div className="flex flex-1 items-center justify-center bg-chalk px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
              Entrar
            </h1>
            <p className="mt-1 text-sm text-ink-soft">Acesse o painel das aulas.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-ink">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-court"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-ink">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-court"
            />
          </div>

          {error && <p className="text-sm text-flare">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-court px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-court-deep disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
