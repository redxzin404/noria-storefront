# AGENTS.md

## Visão geral
NÓRIA é uma loja virtual com foco em decoração e conforto doméstico, implementada em Next.js com App Router, SQLite e Prisma.

## Regras técnicas
- Use TypeScript estrito e App Router do Next.js.
- Valide os dados do cliente no servidor usando Zod e regras de negócio compatíveis com SQLite.
- Armazene sessões em cookies HttpOnly e use hashing seguro para senhas.
- Proteja rotas administrativas no servidor antes de renderizar ou expor qualquer dado.
- Recalcule subtotal, desconto e total no backend antes de confirmar pedidos.
- Mantenha o armazenamento local e a base de dados para dados persistentes com uso seguro em ambiente de desenvolvimento.
- Evite `any` explícito em código TypeScript; prefira tipos pequenos e expressivos.
- Preserve o comportamento em client/server split, evitando setState síncrono em `useEffect` quando a fonte de verdade pode ser inicializada de forma segura.
- Ajustes visuais e experiências devem respeitar `prefers-reduced-motion` e acessibilidade básica.

## Convenções da equipe
- Atualize `TASKS.md` quando tarefas forem concluídas ou bloqueadas.
- Faça testes focados após alterações relevantes.
- Preserve a identidade visual premium da marca com paleta terrosa e minimalista.
- Use Node.js 22 LTS (mínimo 22.14.0) em desenvolvimento e implantação, conforme `.nvmrc` e `package.json`.
- Use `npm run db:migrate` apenas em desenvolvimento e `npm run db:deploy` para aplicar migrações versionadas em implantação.
- Preserve bancos existentes; não use `db push`, reset ou substituição de arquivo de banco em deploy.
- SQLite local (`prisma/dev.db`) não é considerado armazenamento durável em ambientes serverless/efêmeros.
- Registro atual do projeto: Next.js App Router + TypeScript estrito, Prisma + SQLite está operacional com migrações aplicadas; painel administrativo suporta CRUD básico de produtos, categorias, pedidos, fornecedores e configurações; lint possui avisos de otimização de imagens, não bloqueadores.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
