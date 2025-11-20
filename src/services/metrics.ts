import { Order, Product } from '../models/index.js';
import { skipDbInit } from '../config/env.js';
import { Op } from 'sequelize';

export async function getMetrics() {
  if (skipDbInit) {
    return { totalSales: 0, topProducts: [], lowStock: [] };
  }
  // Aggregate orders for total sales
  const orders = await Order.findAll({
    include: [{ model: Product, attributes: ['id', 'name'] }],
  });
  const totalSales = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  // Top products by quantity
  const map: Record<string, { quantity: number; product: Product }> = {};
  orders.forEach((o) => {
    const prod = (o as any).Product as Product | undefined;
    if (!map[o.productId]) {
      map[o.productId] = { quantity: o.quantity, product: prod! };
    } else {
      map[o.productId].quantity += o.quantity;
    }
  });
  const topProducts = Object.entries(map)
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 5)
    .map(([productId, val]) => ({
      productId,
      name: val.product?.name || 'Unknown',
      totalSold: val.quantity,
    }));

  const lowStockRaw = await Product.findAll({ where: { stock: { [Op.lt]: 5 } } });
  const lowStock = lowStockRaw.map((p) => ({ productId: p.id, name: p.name, stock: p.stock }));

  return { totalSales, topProducts, lowStock };
}
