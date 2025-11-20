import type { Request, Response } from 'express';
import { getShopifyStatus, syncShopifyStub } from '../services/shopify.js';

export async function sync(_req: Request, res: Response) {
  try {
    const result = await syncShopifyStub();
    const { tokenEncrypted, ...safe } = result as any;
    res.json({ success: true, ...safe });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Shopify sync failed', detail: err?.message });
  }
}

export async function status(_req: Request, res: Response) {
  const info = await getShopifyStatus();
  res.json(info);
}
