# ShopMetricsPro

Plataforma de métricas e gestão de loja para pequenos e médios negócios. API em Node/TypeScript (Express + Apollo GraphQL), com Postgres/Sequelize, autenticação JWT (Google OAuth opcional), integração Shopify (stub/REST), relatórios PDF/CSV, validação com Zod, Swagger e hardening de segurança.

## Features
✅ Autenticação de usuários (JWT: access/refresh)
✅ Produtos: criar, listar, atualizar e excluir (REST)
✅ Pedidos: criar e listar do usuário (REST)
✅ Métricas e relatórios (GraphQL + PDF/CSV)
✅ Integração Shopify (stub local ou REST Admin real)
✅ Validação com Zod e documentação Swagger
✅ Segurança: Helmet, CORS configurável, rate limit, erros não verbosos
✅ Smoke test end‑to‑end e seeds de exemplo

## Tecnologias
- Node.js, TypeScript
- Express, CORS, express-rate-limit, Helmet, Morgan
- Apollo GraphQL, graphql-tag
- PostgreSQL (pg) e Sequelize
- JSON Web Token (jsonwebtoken)
- Zod (validações de schema)
- PdfKit, csv-stringify (relatórios)
- Axios (HTTP), Passport Google OAuth (opcional)
- Dotenv (config .env)

## Estrutura do Projeto
```
ShopMetricsPro/
├── src/
│   ├── config/           # Variáveis de ambiente
│   │   └── env.ts
│   ├── db/               # Conexão ao banco
│   │   └── sequelize.ts
│   ├── controllers/      # Lógica das rotas REST
│   │   ├── authController.ts
│   │   ├── productsController.ts
│   │   ├── ordersController.ts
│   │   ├── reportsController.ts
│   │   └── shopifyController.ts
│   ├── middleware/
│   │   └── auth.ts       # requireAuth (JWT)
│   ├── models/           # Sequelize models
│   │   ├── user.ts, product.ts, order.ts, report.ts, refreshToken.ts
│   │   └── index.ts      # associações
│   ├── routes/           # Rotas REST + Swagger
│   │   ├── auth.ts, products.ts, orders.ts, reports.ts, shopify.ts, swagger.ts
│   ├── services/         # Regras de domínio
│   │   ├── auth.ts, jwt.ts, metrics.ts, report.ts, shopify.ts
│   ├── graphql/          # Schema e resolvers
│   │   ├── schema.ts, resolvers.ts
│   ├── utils/
│   │   └── crypto.ts
│   ├── scripts/          # Seed e smoke test
│   │   ├── seed.ts, smoke.ts
│   └── index.ts          # Bootstrap do servidor
├── .env                  # Variáveis (ignorado no git)
├── package.json, tsconfig.json, README.md
```

## Instalação
```powershell
# Clone seu repositório e entre na pasta
npm install

# Configure .env (exemplo mínimo)
# DATABASE_URL=postgres://user:pass@localhost:5432/shopmetricspro
# JWT_ACCESS_SECRET=uma-chave-bem-forte
# JWT_REFRESH_SECRET=outra-chave-bem-forte
# SEED_SAMPLE=true

# Dev (watch) ou produção
npm run dev
# ou
npm run build
npm start
```
Servidor em: `http://localhost:4000` (use `PORT` para alterar). Endpoints: `/docs`, `/graphql`, `/healthz`.

## Endpoints (REST) principais
- Auth: `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/logout/all`, `GET /auth/me`
- Produtos: `GET/POST /products`, `PUT/DELETE /products/:id`
- Pedidos: `GET/POST /orders`
- Relatórios: `POST /reports`, `GET /reports/:id/download`
- Shopify: `GET /shopify/sync`, `GET /shopify/status`
- Health: `GET /healthz` | Docs: `GET /docs`

## GraphQL (POST /graphql)
- Query: `metrics { totalSales topProducts { name totalSold } }`
- Mutation: `generateReport(month, format)` e `syncShopify()`
- Observação: mutations exigem JWT em `Authorization: Bearer <access>`

## Exemplos de Uso (curl)
Registrar e logar:
```bash
curl -X POST http://localhost:4000/auth/signup \
	-H "Content-Type: application/json" \
	-d '{"email":"alice@example.com","password":"secret123"}'

curl -X POST http://localhost:4000/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"alice@example.com","password":"secret123"}'
```
Listar produtos (JWT):
```bash
curl http://localhost:4000/products -H "Authorization: Bearer <ACCESS>"
```
GraphQL - métricas e relatório (JWT):
```bash
curl -X POST http://localhost:4000/graphql \
	-H "Authorization: Bearer <ACCESS>" -H "Content-Type: application/json" \
	-d '{"query":"{ metrics { totalSales } }"}'

curl -X POST http://localhost:4000/graphql \
	-H "Authorization: Bearer <ACCESS>" -H "Content-Type: application/json" \
	-d '{"query":"mutation($m:String!,$f:String!){ generateReport(month:$m, format:$f){ id url }}","variables":{"m":"2025-11","f":"pdf"}}'
```
Shopify sync (JWT):
```bash
curl http://localhost:4000/shopify/sync -H "Authorization: Bearer <ACCESS>"
```

## Variáveis de Ambiente (essenciais)
- `DATABASE_URL` | `PORT` (padrão 4000)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TTL` (1h), `JWT_REFRESH_TTL` (7d)
- `SEED_SAMPLE` (gera dados exemplo) | `ENABLE_DEV_ROUTES` (rotas dev, não use em produção)
- `CORS_ORIGIN` (origens permitidas, separadas por vírgula)
- Google OAuth (opcional): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `GOOGLE_OAUTH_DISABLED`
- Shopify (opcional): `SHOPIFY_SHOP_DOMAIN`, `SHOPIFY_ADMIN_TOKEN`, `SHOPIFY_API_VERSION`, `SHOPIFY_AES_SECRET`

## Segurança
- Helmet + rate-limit (100 req/min/IP) + cabeçalhos seguros
- CORS configurável via `CORS_ORIGIN`
- Mutations GraphQL exigem JWT; relatórios vinculados ao dono; download com checagem de caminho
- Rotas de desenvolvimento desativadas por padrão
- Mensagens de erro sem detalhes sensíveis

## Smoke Test (E2E)
```powershell
npm run build
$env:PORT=4000; npm start

$env:PORT=4000; node dist/scripts/smoke.js
```

## 12‑Factor (resumo)
- Config no ambiente | Processos stateless | Logs em stdout | Build/Release/Run separados

## Documentação
- Swagger: `GET /docs`
- GraphQL: `POST /graphql`

##Contact
For questions or suggestions, please contact: jhessika.smp@gmail.com
