"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logomark } from "@/components/Logomark";

const links = [
  { href: "/dashboard", label: "Dashboard", hint: "Visão geral" },
  { href: "/presencas", label: "Presenças", hint: "Chamada do dia" },
  { href: "/placar", label: "Placar", hint: "Marcador ao vivo" },
  { href: "/sorteador", label: "Sorteador", hint: "Sortear alunos" },
  { href: "/alunos", label: "Alunos", hint: "Cadastro e turmas" },
  { href: "/pagamentos", label: "Pagamentos", hint: "Mensalidades" },
];

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Barra superior — visível só no mobile */}
      <header className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line bg-ink px-4 text-chalk lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="-ml-2 rounded-md p-2 text-chalk/80 transition-colors hover:bg-white/5"
        >
          <MenuIcon />
        </button>
        <div className="flex items-center gap-2.5">
          <Logomark size={32} />
          <p className="font-display text-base font-extrabold tracking-tight">
            Presença
          </p>
        </div>
      </header>

      {/* Overlay do drawer — mobile, fecha ao clicar fora */}
      {open && (
        <button
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] shrink-0 flex-col justify-between bg-ink px-5 py-6 text-chalk transition-transform duration-200 ease-out lg:static lg:z-auto lg:h-screen lg:w-64 lg:max-w-none lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-8">
          <div className="flex items-center justify-between">
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
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="rounded-md p-2 text-chalk/60 transition-colors hover:bg-white/5 lg:hidden"
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
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
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-chalk/50 transition-colors hover:bg-white/5 hover:text-chalk"
        >
          Sair
        </button>
      </aside>
    </>
  );
}
