import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import type { Request, Response, NextFunction } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { env, isProd, skipDbInit } from './config/env.js';
import { initDb } from './db/sequelize.js';
import passport from 'passport';
import { authRouter } from './routes/auth.js';
import { reportsRouter } from './routes/reports.js';
import { productsRouter } from './routes/products.js';
import { ordersRouter } from './routes/orders.js';
import { devRouter } from './routes/dev.js';
import { shopifyRouter } from './routes/shopify.js';

async function bootstrap() {
  const app = express();
  if (isProd) {
    app.set('trust proxy', 1);
  }

  app.use(helmet({
    contentSecurityPolicy: false,
  }));

  app.use((_: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    if (isProd) {
      res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    }
    next();
  });

  app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

  app.use(cors({ origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map(s => s.trim()) : true }));
  app.use(morgan(isProd ? 'combined' : 'dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(passport.initialize());

  app.get('/healthz', (_req: Request, res: Response) => res.json({ status: 'ok' }));

  app.use('/auth', authRouter);
  app.use('/reports', reportsRouter);
  app.use('/products', productsRouter);
  app.use('/orders', ordersRouter);
  if (env.ENABLE_DEV_ROUTES === 'true' && !isProd) {
    app.use('/dev', devRouter);
    console.warn('Dev routes enabled at /dev (do not enable in production)');
  }
  app.use('/shopify', shopifyRouter);

  const { swaggerDoc } = await import('./routes/swagger.js');
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc as any));

  const apollo = new ApolloServer({ typeDefs, resolvers });
  await apollo.start();
  app.use('/graphql', expressMiddleware(apollo, {
    context: async ({ req }: { req: Request }) => ({ token: req.headers.authorization || null }),
  }));

  if (skipDbInit) {
    console.log('DB init skipped by SKIP_DB_INIT');
  } else {
    await initDb();
    if (env.SEED_SAMPLE === 'true') {
      console.log('Running sample seed (SEED_SAMPLE=true)...');
      const { runSeed } = await import('./scripts/seed.js');
      await runSeed();
    }
  }

  const port = Number(env.PORT) || 4001;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
    console.log(`GraphQL at http://localhost:${port}/graphql`);
    console.log(`Swagger at http://localhost:${port}/docs`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap', err);
  process.exit(1);
});
