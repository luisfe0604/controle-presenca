"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/alunos", label: "Alunos" },
  { href: "/presencas", label: "Presenças" },
  { href: "/pagamentos", label: "Pagamentos" },
];

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
    <aside className="flex h-screen w-56 flex-col justify-between border-r border-neutral-200 bg-white p-4">
      <nav className="space-y-1">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="rounded-md px-3 py-2 text-left text-sm font-medium text-neutral-500 hover:bg-neutral-100"
      >
        Sair
      </button>
    </aside>
  );
}
