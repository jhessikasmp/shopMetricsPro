import axios from 'axios';
import { env } from '../config/env.js';
import { encrypt } from '../utils/crypto.js';
import { Product, Order } from '../models/index.js';

export async function syncShopifyStub() {
  // If Admin API creds present, hit Shopify REST Admin for real counts
  if (env.SHOPIFY_SHOP_DOMAIN && env.SHOPIFY_ADMIN_TOKEN) {
    const version = env.SHOPIFY_API_VERSION || '2024-10';
    const baseUrl = `https://${env.SHOPIFY_SHOP_DOMAIN}/admin/api/${version}`;
    try {
      const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN };
      const [prodResp, orderResp] = await Promise.all([
        axios.get<{ count: number }>(`${baseUrl}/products/count.json`, { headers }),
        axios.get<{ count: number }>(`${baseUrl}/orders/count.json`, { headers }),
      ]);
      const base = {
        products: prodResp.data.count ?? 0,
        orders: orderResp.data.count ?? 0,
        lastSyncAt: new Date().toISOString(),
        source: 'shopify-rest',
      } as const;
      // Keep encrypted token info if available
      if (env.SHOPIFY_API_KEY && env.SHOPIFY_API_SECRET && env.SHOPIFY_AES_SECRET) {
        const tokenEncrypted = encrypt(env.SHOPIFY_API_KEY + ':' + env.SHOPIFY_API_SECRET);
        return { ...base, tokenEncrypted };
      }
      return base;
    } catch (err: any) {
      console.warn('Shopify REST call failed, falling back to DB counts:', err?.message);
      // Fall through to DB-based stub
    }
  }

  // DB-based stub path
  const [productsCount, ordersCount] = await Promise.all([
    Product.count(),
    Order.count(),
  ]);
  const base = {
    products: productsCount,
    orders: ordersCount,
    lastSyncAt: new Date().toISOString(),
    source: 'stub-db',
  } as const;
  if (env.SHOPIFY_API_KEY && env.SHOPIFY_API_SECRET && env.SHOPIFY_AES_SECRET) {
    const tokenEncrypted = encrypt(env.SHOPIFY_API_KEY + ':' + env.SHOPIFY_API_SECRET);
    return { ...base, tokenEncrypted };
  }
  return base;
}

export async function getShopifyStatus() {
  const active = Boolean(env.SHOPIFY_SHOP_DOMAIN && env.SHOPIFY_ADMIN_TOKEN);
  const source = active ? 'shopify-rest' : 'stub-db';
  const info: any = {
    success: true,
    active,
    source,
    shopDomain: env.SHOPIFY_SHOP_DOMAIN || null,
    apiVersion: env.SHOPIFY_API_VERSION || '2024-10',
    hasAdminToken: Boolean(env.SHOPIFY_ADMIN_TOKEN),
    hasAesSecret: Boolean(env.SHOPIFY_AES_SECRET),
  };

  if (active) {
    try {
      const baseUrl = `https://${env.SHOPIFY_SHOP_DOMAIN}/admin/api/${info.apiVersion}`;
      const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN as string };
      const resp = await axios.get<{ count: number }>(`${baseUrl}/products/count.json`, { headers });
      info.reachable = true;
      info.sample = { productsCount: resp.data?.count ?? 0 };
    } catch (e: any) {
      info.reachable = false;
      info.error = e?.message || 'unreachable';
    }
  }

  return info;
}
