import 'dotenv/config';
import { initDb } from '../db/sequelize.js';
import { sequelize } from '../db/sequelize.js';
import { Product, Order, User, Report } from '../models/index.js';
import { generateReport } from '../services/report.js';
import { skipDbInit } from '../config/env.js';

export async function runSeed() {
  console.log('Starting seed...');
  if (skipDbInit) {
    console.log('Skip DB init active; aborting seed.');
    return;
  }
  await initDb();
  // Use plain sync to avoid fragile ALTER attempts in medium-level setup
  await sequelize.sync();

  // User
  let user = await User.findOne({ where: { email: 'owner@example.com' } });
  if (!user) {
    user = await User.create({ email: 'owner@example.com', name: 'Store Owner', googleId: null });
    console.log('Created sample user');
  }

  // Products
  const existingProducts = await Product.count();
  if (existingProducts === 0) {
    await Product.bulkCreate([
      { name: 'Basic T-shirt', sku: 'TSHIRT-BASE', stock: 42, price: 39.9 },
      { name: 'Jeans Pants', sku: 'JEANS-001', stock: 15, price: 129.9 },
      { name: 'Comfort Sneakers', sku: 'SHOES-FAST', stock: 8, price: 249.9 },
      { name: 'Logo Cap', sku: 'CAP-LOGO', stock: 3, price: 59.9 },
    ]);
    console.log('Seeded products');
  }

  const products = await Product.findAll();
  // Orders
  const existingOrders = await Order.count();
  if (existingOrders === 0 && products.length) {
    const ordersData = products.slice(0, 3).map((p, idx) => ({
      productId: p.id,
      userId: user!.id,
      quantity: (idx + 1) * 2,
      totalPrice: ((idx + 1) * 2) * p.price,
    }));
    await Order.bulkCreate(ordersData);
    console.log('Seeded orders');
  }

  // Report sample
  const reportAlready = await Report.findOne({ where: { month: '2025-11', format: 'pdf' } });
  if (!reportAlready) {
  const rpt = await generateReport('2025-11', 'pdf');
  await rpt.update({ userId: user!.id });
    console.log('Generated sample report 2025-11.pdf');
  }

  console.log('Seed complete');
}
// Always run when invoked directly (ESM friendly)
runSeed().catch((e) => {
  console.error('Seed failed', e);
  process.exit(1);
});