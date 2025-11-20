import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4000'),

  DATABASE_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default('1h'),
  JWT_REFRESH_TTL: z.string().default('7d'),

  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_CALLBACK_URL: z.string().url().optional().default('http://localhost:4000/auth/google/callback'),
  GOOGLE_OAUTH_DISABLED: z.string().optional().default('false'),

  SHOPIFY_API_KEY: z.string().optional().default(''),
  SHOPIFY_API_SECRET: z.string().optional().default(''),
  SHOPIFY_SHOP_DOMAIN: z.string().optional().default(''),
  SHOPIFY_ADMIN_TOKEN: z.string().optional().default(''),
  SHOPIFY_API_VERSION: z.string().optional().default('2024-10'),
  SHOPIFY_REDIRECT_URI: z.string().url().optional().default('http://localhost:4000/shopify/oauth/callback'),
  SHOPIFY_SCOPES: z.string().optional().default('read_products,read_orders'),
  SHOPIFY_AES_SECRET: z.string().min(16).optional().default('development-aes-secret-please-change'),

  SWAGGER_TITLE: z.string().default('ShopMetricsPro API'),
  SWAGGER_VERSION: z.string().default('0.1.0'),
  SWAGGER_DESC: z.string().default('API for small business metrics'),

  SKIP_DB_INIT: z.string().optional().default('false'),
  SEED_SAMPLE: z.string().optional().default('false'),
  ENABLE_DEV_ROUTES: z.string().optional().default('false'),
  CORS_ORIGIN: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Environment validation failed');
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const skipDbInit = env.SKIP_DB_INIT === 'true';
export const googleOauthDisabled = env.GOOGLE_OAUTH_DISABLED === 'true';
