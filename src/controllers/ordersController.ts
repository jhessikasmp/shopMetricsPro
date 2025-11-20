import type { Request, Response } from 'express';
import { z } from 'zod';
import { Order } from '../models/order.js';
import { Product } from '../models/product.js';

const orderCreateSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

export async function list(req: any, res: Response) {
  const items = await Order.findAll({ where: { userId: req.userId }, order: [['createdAt', 'DESC']] });
  res.json(items);
}

export async function create(req: any, res: Response) {
  const parsed = orderCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const product = await Product.findByPk(parsed.data.productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.stock < parsed.data.quantity) return res.status(400).json({ error: 'Insufficient stock' });
  const totalPrice = product.price * parsed.data.quantity;
  try {
    const order = await Order.create({ productId: product.id, userId: req.userId, quantity: parsed.data.quantity, totalPrice });
    await product.update({ stock: product.stock - parsed.data.quantity });
    res.status(201).json(order);
  } catch (err: any) {
    res.status(500).json({ error: 'Create failed' });
  }
}
