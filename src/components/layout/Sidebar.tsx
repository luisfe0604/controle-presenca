"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Dashboard", hint: "Visão geral" },
  { href: "/presencas", label: "Presenças", hint: "Chamada do dia" },
  { href: "/alunos", label: "Alunos", hint: "Cadastro e turmas" },
  { href: "/pagamentos", label: "Pagamentos", hint: "Mensalidades" },
];

const PLACAR_URL = "https://score-pink.vercel.app/";

function Logomark() {
  return (
    <span className="relative flex h-9 w-9 items-center justify-center rounded-md bg-court">
      <span className="absolute inset-y-1.5 left-1/2 w-px -translate-x-1/2 bg-chalk/70" />
      <span className="relative h-2 w-2 rounded-full bg-flare" />
    </span>
  );
}

function ExternalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between bg-ink px-5 py-6 text-chalk">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Logomark />
          <div className="leading-tight">
            <p className="font-display text-lg font-extrabold tracking-tight">
              Presença
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-chalk/50">
              Gestão · Vôlei
            </p>
          </div>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex flex-col rounded-lg px-3 py-2.5 transition-colors ${
                  active ? "bg-court text-white" : "text-chalk/70 hover:bg-white/5"
                }`}
              >
                <span className="text-sm font-semibold">{link.label}</span>
                <span
                  className={`text-[11px] ${
                    active ? "text-white/70" : "text-chalk/40"
                  }`}
                >
                  {link.hint}
                </span>
              </Link>
            );
          })}

          {/* Ferramenta externa — abre o placar ao vivo em outra aba */}
          <a
            href={PLACAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-between rounded-lg border border-dashed border-white/15 px-3 py-2.5 text-chalk/70 transition-colors hover:border-court hover:text-chalk"
          >
            <span className="flex flex-col">
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                Placar
                <ExternalIcon />
              </span>
              <span className="text-[11px] text-chalk/40">Marcador ao vivo</span>
            </span>
          </a>
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-chalk/50 transition-colors hover:bg-white/5 hover:text-chalk"
      >
        Sair
      </button>
    </aside>
  );
}
