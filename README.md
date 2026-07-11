# Quadra — Gestão de vôlei

Aplicativo fullstack (Next.js, App Router) para gestão de uma escola de
vôlei: presenças, alunos, planos, pagamentos e um painel financeiro.
Antes era um frontend React (Vite) que consumia um backend Express
separado; foi reescrito como um único projeto Next.js com Route Handlers
que acessam o Postgres (Supabase) diretamente.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase Auth (via `@supabase/ssr`, sessão em cookies)
- PostgreSQL (Supabase) acessado com `pg` (SQL puro, sem ORM)
- Vercel Cron para o fechamento mensal automático

## Configuração

1. Copie `.env.example` para `.env.local` e preencha:

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   DATABASE_URL=postgresql://...
   CRON_SECRET=...            # opcional em dev; obrigatório em produção
   ```

2. Instale as dependências e rode:

   ```bash
   npm install
   npm run dev
   ```

## Estrutura

- `src/app/(app)/*` — páginas autenticadas (dashboard, alunos, presencas, pagamentos)
- `src/app/login` — tela de login
- `src/app/api/*` — Route Handlers (alunos, planos, presenca, pagamentos, dashboard, cron)
- `src/lib/*` — pool do Postgres, clients Supabase, helpers de auth/formatação
- `src/middleware.ts` — protege as rotas autenticadas (redireciona para `/login`)
- `vercel.json` — agenda o cron `/api/cron/fechar-mes` (dia 1, ~00:00 America/Sao_Paulo)

## Deploy (Vercel)

Defina as mesmas variáveis de ambiente no projeto da Vercel. O
`CRON_SECRET` deve estar setado — a Vercel envia
`Authorization: Bearer <CRON_SECRET>` ao acionar o cron, e o endpoint
recusa chamadas sem esse header.
