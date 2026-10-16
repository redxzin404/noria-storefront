# NÓRIA

Loja virtual moderna para decoração, organização, iluminação, cozinha e conforto.

## Tecnologias
- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma + SQLite local / PostgreSQL para Vercel
- Argon2 para hashing de senhas
- Vitest

## Requisitos de runtime
- Node.js 22 LTS (mínimo 22.14.0), fixado por `.nvmrc` e `package.json`.
- npm 10 ou superior.

## Execução local
1. Se usar nvm, ative a versão definida pelo projeto:
   nvm install
   nvm use
2. Instale as dependências:
   npm install
3. Copie `.env.example` para `.env` e defina `DATABASE_URL`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`.
4. Gere o cliente Prisma:
   npm run db:generate
5. Rode as migrações em desenvolvimento:
   npm run db:migrate
6. Popule dados de exemplo:
   npm run db:seed
7. Inicie a aplicação:
   npm run dev

## Criar primeiro administrador
Use variáveis de ambiente e execute:

ADMIN_EMAIL=admin@noria.local ADMIN_PASSWORD='SuaSenhaForte@123' npm run admin:create

A senha deve ser definida fora do código e mantida em ambiente local seguro.

## Integrações comerciais

Foram implementados adaptadores de servidor para Mercado Pago Checkout Pro e cotação de frete Melhor Envio. O cadastro e a associação de fornecedores continuam manuais; o sistema não envia pedidos a fornecedores nem compra etiquetas do Melhor Envio. Não considere pedidos pendentes como pagos.

As variáveis de integração podem ser consultadas em `.env.example`. O painel `/admin/integrations` mostra somente se as variáveis esperadas estão presentes; isso não testa conectividade nem confirma que o serviço está funcionando. As credenciais devem ser configuradas no ambiente seguro do servidor e nunca expostas ao cliente.

Para validar o fluxo, configure credenciais sandbox dos dois serviços, preencha peso e dimensões de embalagem reais dos produtos, configure CEP de origem e e-mail de contato. Publique uma URL HTTPS acessível e cadastre `https://SEU-DOMINIO/api/webhooks/mercadopago` como URL de webhook no painel do Mercado Pago, com eventos de pagamento. O pedido e o estoque são reservados por até 30 minutos; eventos de webhook assinados atualizam o pagamento e liberam reservas recusadas/canceladas/expiradas. Se o pagamento for confirmado após uma reserva expirar, o pedido é marcado para revisão manual.

Consulte as documentações oficiais: [Mercado Pago Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/create-payment-preference), [Mercado Pago Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks), [Melhor Envio - Cálculo de fretes](https://docs.melhorenvio.com.br/reference/calculo-de-fretes-por-produtos.md) e [Melhor Envio - Sandbox](https://docs.melhorenvio.com.br/docs/sandbox.md). O access token OAuth do Melhor Envio precisa ser renovado conforme a validade da conta; a aplicação não renova tokens automaticamente.

O checkout local sem credenciais oferece apenas uma opção de frete ilustrativa e cria pedidos de demonstração sem cobrar e sem reservar estoque. Em produção, o endpoint recusa criar pedidos se os dois provedores não estiverem configurados explicitamente para `production`. Configure e teste primeiro em sandbox. O deploy também precisa de HTTPS, armazenamento persistente e backups. Configure um cron para chamar `POST /api/maintenance/release-expired-reservations` com `Authorization: Bearer $CRON_SECRET` a cada poucos minutos; a aplicação não possui worker/cron embutido.

## Banco de dados, arquivos e implantação

O SQLite em `prisma/dev.db` é a configuração de desenvolvimento local. O arquivo é persistente no computador local, mas **não** deve ser assumido como persistente em funções serverless ou hospedagens cujo filesystem é efêmero ou compartilhado entre instâncias. Não publique com esse armazenamento sem confirmar que o provedor oferece volume persistente exclusivo, backups e suporte às operações concorrentes esperadas.

O schema SQLite e seu histórico de migrações continuam sendo usados no desenvolvimento local. Para Vercel + Neon, há um schema e um histórico PostgreSQL separados em `prisma/postgres/`; as rotinas de deploy não substituem nem alteram o banco SQLite local.

### Demonstração pública com Vercel + Neon

1. Crie um projeto PostgreSQL no Neon e conecte-o ao projeto Vercel. Configure `DATABASE_URL` com a URL pooled e `DIRECT_DATABASE_URL` com a URL direta/unpooled, ambas com TLS. Não cole credenciais em código ou neste repositório.
2. Configure `NORIA_APP_URL` com a origem pública canônica e `CRON_SECRET` com um valor aleatório forte. Configure `NORIA_DEMO_MODE=true` e `NEXT_PUBLIC_NORIA_DEMO_MODE=true`; checkout, cadastro e newsletter ficam desativados, sem coletar dados pessoais nessa demonstração.
3. Não configure credenciais do Mercado Pago ou Melhor Envio na demonstração.
4. O `vercel.json` executa `npm run vercel-build`, que gera o cliente Prisma PostgreSQL, aplica apenas migrações versionadas com `db:deploy:postgres` e executa o build. Não executa seed durante cada deploy.
5. Uma única vez, quando o banco Neon estiver pronto, rode `npm run db:seed:postgres` com as URLs Neon configuradas no ambiente local seguro para inserir somente o catálogo demonstrativo; esse comando não cria administrador e restaura o cliente SQLite local ao terminar.
6. Faça deploy pelo repositório GitHub conectado à Vercel. O domínio `*.vercel.app` pode ser usado para a primeira demonstração; domínio próprio pode ser associado depois.

Para outro ambiente, gere o cliente apropriado e execute `npm run db:deploy:postgres` antes do build. `db:deploy:postgres` aplica somente migrações versionadas; nunca use `db push` ou `migrate reset` como procedimento de produção.

Dados do SQLite local **não** são enviados ao Neon neste fluxo. O seed de demonstração é idempotente, mas atualiza produtos e categorias de exemplo se for executado novamente; não o inclua no comando de cada deploy. Para migrar dados reais no futuro, será necessário um processo separado de exportação, cópia e validação.

As imagens seed atuais usam URLs remotas e `public/` contém apenas assets estáticos do scaffold. O painel não implementa upload persistente de mídia. Não use o disco temporário da aplicação para uploads; antes de habilitar essa função, integre armazenamento persistente de objetos e validação de arquivos no servidor.

O projeto não possui uma API ou automação Python própria. A ocorrência de módulos Python dentro de `node_modules` é de dependências instaladas, não um serviço da NÓRIA; nenhum backend Python foi removido ou precisa ser implantado.

O deploy deve suportar a versão de Node declarada, execução do servidor Next.js, variáveis privadas, migrações Prisma e persistência apropriada ao banco escolhido. Hospedagem serverless gratuita não implica SQLite durável, tarefas cron contínuas ou serviço Python. Confirme esses recursos e seus limites no provedor escolhido antes de operar a loja.

O App Router fornece `/robots.txt` e `/sitemap.xml`; o sitemap lista páginas públicas existentes e produtos ativos. Defina `NORIA_APP_URL` para a origem pública canônica no ambiente de implantação. Conta, carrinho, checkout, autenticação, administração, APIs e páginas de pedido são excluídos das regras de rastreamento.

## Acesso rápido
- Homepage: http://localhost:3000/
- Catálogo: http://localhost:3000/catalog
- Login: http://localhost:3000/login
- Admin: http://localhost:3000/admin
