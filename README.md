# ShopMetricsPro

Metrics and store management backend for small/medium businesses. Node/TypeScript API (Express + Apollo GraphQL) with Postgres/Sequelize, JWT authentication (optional Google OAuth), Shopify integration (stub/REST), PDF/CSV reports, Zod validation, Swagger docs, and security hardening.

## Features
✅ User authentication (JWT: access/refresh)
✅ Products: create, list, update, delete (REST)
✅ Orders: create and list for the current user (REST)
✅ Metrics and reports (GraphQL + PDF/CSV)
✅ Shopify integration (local stub or real REST Admin)
✅ Validation with Zod and Swagger documentation
✅ Security: Helmet, configurable CORS, rate limit, non-verbose errors
✅ End-to-end smoke test and sample seeds

## Technologies
- Node.js, TypeScript
- Express, CORS, express-rate-limit, Helmet, Morgan
- Apollo GraphQL, graphql-tag
- PostgreSQL (pg) and Sequelize
- JSON Web Token (jsonwebtoken)
- Zod (schema validation)
- PdfKit, csv-stringify (reports)
- Axios (HTTP), Passport Google OAuth (optional)
- Dotenv (.env configuration)

## Project Structure
```
ShopMetricsPro/
├── src/
│   ├── config/           # Environment variables
│   │   └── env.ts
│   ├── db/               # Database connection
│   │   └── sequelize.ts
│   ├── controllers/      # REST route handlers
│   │   ├── authController.ts
│   │   ├── productsController.ts
│   │   ├── ordersController.ts
│   │   ├── reportsController.ts
│   │   └── shopifyController.ts
│   ├── middleware/
│   │   └── auth.ts       # requireAuth (JWT)
│   ├── models/           # Sequelize models
│   │   ├── user.ts, product.ts, order.ts, report.ts, refreshToken.ts
│   │   └── index.ts      # associations
│   ├── routes/           # REST routes + Swagger
│   │   ├── auth.ts, products.ts, orders.ts, reports.ts, shopify.ts, swagger.ts
│   ├── services/         # Domain services
│   │   ├── auth.ts, jwt.ts, metrics.ts, report.ts, shopify.ts
│   ├── graphql/          # Schema and resolvers
│   │   ├── schema.ts, resolvers.ts
│   ├── utils/
│   │   └── crypto.ts
│   ├── scripts/          # Seed and smoke test
│   │   ├── seed.ts, smoke.ts
│   └── index.ts          # Server bootstrap
├── .env                  # Environment vars (git-ignored)
├── package.json, tsconfig.json, README.md
```

## Installation
```powershell
# In your project folder
npm install

# Minimal .env (or copy from .env.example)
# DATABASE_URL=postgres://user:pass@localhost:5432/shopmetricspro
# JWT_ACCESS_SECRET=very-strong-access-secret
# JWT_REFRESH_SECRET=very-strong-refresh-secret
# SEED_SAMPLE=true

# Dev (watch) or production
npm run dev
# or
npm run build
npm start
```
Server: `http://localhost:4000` (use `PORT` to change). Endpoints: `/docs`, `/graphql`, `/healthz`.

## Key REST Endpoints
- Auth: `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/logout/all`, `GET /auth/me`
- Products: `GET/POST /products`, `PUT/DELETE /products/:id`
- Orders: `GET/POST /orders`
- Reports: `POST /reports`, `GET /reports/:id/download`
- Shopify: `GET /shopify/sync`, `GET /shopify/status`
- Health: `GET /healthz` | Docs: `GET /docs`

## GraphQL (POST /graphql)
- Query: `metrics { totalSales topProducts { name totalSold } }`
- Mutations: `generateReport(month, format)` and `syncShopify()`
- Note: mutations require a JWT in `Authorization: Bearer <access>`

## Usage Examples (curl)
Register and login:
```bash
curl -X POST http://localhost:4000/auth/signup \
	-H "Content-Type: application/json" \
	-d '{"email":"alice@example.com","password":"secret123"}'

curl -X POST http://localhost:4000/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"alice@example.com","password":"secret123"}'
```
List products (JWT):
```bash
curl http://localhost:4000/products -H "Authorization: Bearer <ACCESS>"
```
GraphQL - metrics and report (JWT):
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

## Environment Variables (essentials)
- `DATABASE_URL` | `PORT` (default 4000)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TTL` (1h), `JWT_REFRESH_TTL` (7d)
- `SEED_SAMPLE` (generate sample data) | `ENABLE_DEV_ROUTES` (dev routes; do not enable in production)
- `CORS_ORIGIN` (allowed origins, comma-separated)
- Google OAuth (optional): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `GOOGLE_OAUTH_DISABLED`
- Shopify (optional): `SHOPIFY_SHOP_DOMAIN`, `SHOPIFY_ADMIN_TOKEN`, `SHOPIFY_API_VERSION`, `SHOPIFY_AES_SECRET`

## Security
- Helmet + rate-limit (100 req/min/IP) + secure headers
- Configurable CORS via `CORS_ORIGIN`
- GraphQL mutations require JWT; reports are owned by user; safe path checks on downloads
- Dev routes disabled by default
- Error messages avoid leaking internals

## Smoke Test (E2E)
```powershell
npm run build
$env:PORT=4000; npm start

$env:PORT=4000; node dist/scripts/smoke.js
```

## 12‑Factor (summary)
- Env-config | Stateless processes | Logs to stdout | Separate build/release/run

## Documentation
- Swagger: `GET /docs`
- GraphQL: `POST /graphql`

## Deploy on Render
Use the `render.yaml` blueprint to create the Node Web Service and a managed Postgres.

Quick steps:
1) Connect the repo on Render, choose “New +” > “Blueprint”.
2) Render reads `render.yaml` and creates:
	 - Web (Node): build `npm ci && npm run build`, start `npm start`, health `/healthz`.
	 - Postgres (free) and injects `DATABASE_URL`.
3) Set required secrets: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
4) Set `CORS_ORIGIN` to your frontend domain.
5) Deploy and check `https://<your-service>.onrender.com/healthz`.

Notes
- `ENABLE_DEV_ROUTES=false` in production.
- `SEED_SAMPLE=false` by default (avoid seeding in prod).
- Optional: configure Shopify/Google env vars.

## Contact
Questions or suggestions: jhessika.smp@gmail.com
# shopMetricsDEMO
