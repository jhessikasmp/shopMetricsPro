import type { Request, Response } from 'express';
import { z } from 'zod';
import { Product } from '../models/product.js';

const productCreateSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(3),
  stock: z.number().int().min(0),
  price: z.number().min(0),
});
const productUpdateSchema = productCreateSchema.partial();

export async function list(_req: Request, res: Response) {
  const items = await Product.findAll({ order: [['createdAt', 'DESC']] });
  res.json(items);
}

export async function create(req: Request, res: Response) {
  const parsed = productCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const created = await Product.create(parsed.data);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Create failed' });
  }
}

export async function update(req: Request, res: Response) {
  const parsed = productUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  try {
    await product.update(parsed.data);
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: 'Update failed' });
  }
}

export async function remove(req: Request, res: Response) {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  await product.destroy();
  res.json({ success: true });
}
