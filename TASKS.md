# NÓRIA — Tarefas e progresso

## Status geral
- [x] Inicialização do projeto Next.js + Tailwind
- [x] Configuração de Prisma com SQLite
- [x] Estrutura inicial do storefront, autenticação e painel administrativo
- [x] Migração do Prisma aplicada com schema compatível ao SQLite
- [x] Build de produção validado com Next.js
- [x] Ajustes de segurança/typing para rotas e estado do carrinho
- [x] Testes mínimos adicionados para utilitários de catálogo
- [x] Documentação atualizada para execução local e administração
- [x] Auditoria arquitetural confirma Next.js App Router já existente; migração para outro framework descartada por não ser necessária
- [x] Runtime de Node LTS e processo de deploy Prisma documentados/configurados sem alterar dados

## Progresso
- Storefront funcional com homepage premium, catálogo, página de produto, carrinho persistente e checkout simulado.
- Autenticação e autorização em cookie HttpOnly para uso do painel administrativo.
- Banco Prisma operacional com produtos, usuários, categorias, pedidos, sessões e configurações.
- Seed de dados de exemplo; a criação do administrador exige credenciais explícitas.
- Implementação de regras de compatibilidade SQLite e revisão de dependências/erros visuais das páginas.

## Verificações executadas
- `npx prisma migrate status` — schema sincronizado com as três migrações; nenhuma migração nova de banco foi necessária para a migração arquitetural
- Node `v22.23.3` — build, testes e lint executados sob Node 22 LTS
- `npm run build` — sucesso, com rotas metadata de robots e sitemap incluídas
- `npm run lint` — sem erros; 9 avisos pré-existentes de `<img>` não otimizado
- `npm test` — 8 testes passaram em Vitest 4.1.12
- Smoke test do servidor de produção: homepage, `/robots.txt` e `/sitemap.xml` responderam HTTP 200; URLs do sitemap e diretivas robots conferidas
- `npm audit --omit=dev` — 0 vulnerabilidades em dependências de produção
- `npm audit` — 5 avisos high remanescentes somente na cadeia de desenvolvimento `eslint-config-next`/`@next/eslint-plugin-next` e dependências transitivas; `npm audit fix` propõe downgrade major do config para Next 14, incompatível com o Next 16 instalado
- Teste remoto sandbox Mercado Pago/Melhor Envio — pendente de credenciais e URL pública HTTPS
- Schema PostgreSQL separado — `prisma validate`, geração do client e TypeScript passaram; migração inicial gerada sem alterar SQLite
- Build com `NORIA_DEMO_MODE=true` e `NEXT_PUBLIC_NORIA_DEMO_MODE=true` — passou
- Testes após modo demonstração — 8 passaram; lint sem erros e com os 9 avisos de `<img>` já existentes

## Pendências conhecidas
- O projeto já alcançou um nível funcional de storefront + administração local com CRUD básico de produtos e categorias.
- Há avisos de lint sobre uso de `<img>` em vez de `next/image`; isso não bloqueia o build, mas é importante para otimização futura.
- Adaptadores server-side para Mercado Pago Checkout Pro, webhook assinado e cotações Melhor Envio foram implementados; faltam credenciais sandbox e teste end-to-end externo.
- Fornecedores permanecem em operação manual; não existe integração de sincronização/envio.
- O painel administrativo está em escopo operacional básico e funcional, mas ainda não substitui um CMS enterprise completo.
- SQLite local e ausência de upload persistente não são adequados para um deploy efêmero/multi-instância sem infraestrutura adicional.

## Atualização recente
- Adicionadas páginas de criação/edição de produtos e categorias no painel administrativo.
- Incluídos pedidos e configurações da loja no painel.
- Implementadas ações server-side para criação, edição, exclusão e persistência usando Prisma e validação com Zod.
- Criado cadastro administrativo manual de fornecedores e painel que informa presença de variáveis sem revelar segredos nem alegar conexão testada.
- O endpoint de pedidos agora recalcula preços e estoque no servidor; checkout de demonstração local não cobra pagamentos nem pode ser usado para vendas reais.
- Adicionados adaptadores de pagamento/frete, validação de preço e cotação no servidor, webhook autenticado do Mercado Pago, idempotência do checkout e reservas temporárias de estoque.
- Adicionados campos de dimensões e peso de embalagem para cálculo real de frete, com dados vazios por padrão até o administrador informar medidas confiáveis.
- Auditoria de migração confirmou que o projeto já usa Next.js 16, TypeScript estrito, React 19, Tailwind 4 e Prisma/SQLite; nenhuma aplicação Python própria foi encontrada.
- Adicionados `.nvmrc`, `engines` do Node/npm e script `db:deploy`; documentadas instruções para migrações e limitações de banco, mídia e hospedagem.
- Adicionados `robots.txt` e `sitemap.xml` via convenções metadata do App Router, listando apenas rotas públicas existentes e produtos ativos.
- Vitest e coverage atualizados de 2.x para 4.1.12; os avisos críticos/high do runner foram eliminados.
- Preparada configuração de demonstração Vercel + Neon com schema e migração PostgreSQL separados, mantendo o SQLite local e sem transferir seus registros.
- Checkout, cadastro e newsletter podem ser desativados em modo demonstração; o seed online não cria administrador nem é executado em todo deploy.

## Bloqueios antes de produção comercial
- Configurar contas e credenciais sandbox de Mercado Pago e Melhor Envio, concluir teste end-to-end com webhook público HTTPS e só então preparar credenciais de produção.
- Escolher armazenamento persistente/banco gerenciado e fazer migração com backup antes de publicar em ambiente efêmero ou multi-instância.
- Implementar cancelamentos e reembolsos operacionais no painel; eventos de reembolso já atualizam o estado, mas não executam ação de reembolso no gateway.
- A sincronização e transmissão automática a fornecedores permanece pendente e depende da API/documentação do fornecedor escolhido.

## Pendências para publicar a demonstração
- Criar o repositório GitHub e conectá-lo à Vercel; este diretório ainda não está em um repositório Git.
- Criar e conectar o banco Neon, configurar as variáveis privadas e semear o catálogo demonstrativo sem dados pessoais.
- Executar o deploy Vercel e validar homepage, catálogo, produto e checkout desativado na URL pública.
