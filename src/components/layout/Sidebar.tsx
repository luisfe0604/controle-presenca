"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Dashboard", hint: "Visão geral" },
  { href: "/presencas", label: "Presenças", hint: "Chamada do dia" },
  { href: "/sorteador", label: "Sorteador", hint: "Sortear alunos" },
  { href: "/alunos", label: "Alunos", hint: "Cadastro e turmas" },
  { href: "/pagamentos", label: "Pagamentos", hint: "Mensalidades" },
];

const PLACAR_URL = "https://score-pink.vercel.app/";

function Logomark() {
  return (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-court">
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
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-ink px-4 text-chalk lg:hidden">
        <div className="flex items-center gap-2.5">
          <Logomark />
          <p className="font-display text-base font-extrabold tracking-tight">
            Presença
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="rounded-md p-2 text-chalk/80 transition-colors hover:bg-white/5"
        >
          <MenuIcon />
        </button>
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
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 max-w-[85vw] shrink-0 flex-col justify-between bg-ink px-5 py-6 text-chalk transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 ${
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

            {/* Ferramenta externa — abre o placar ao vivo em outra aba */}
            <a
              href={PLACAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
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
    </>
  );
}
