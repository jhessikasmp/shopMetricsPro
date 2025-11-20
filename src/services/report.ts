import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify';
import { Report } from '../models/report.js';
import { getMetrics } from './metrics.js';

export async function generateReport(month: string, format: string, userId?: string | null) {
  const metrics = await getMetrics();
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  const safeMonth = month.replace(/[^0-9-]/g, '');
  const fileName = `report-${safeMonth}.${format}`;
  const filePath = path.join(reportsDir, fileName);

  if (format === 'pdf') {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(18).text(`Report ${month}`);
    doc.text(`Total Sales: ${metrics.totalSales}`);
    doc.text('Top Products:');
    metrics.topProducts.forEach((p) => doc.text(`- ${p.name} (${p.totalSold})`));
    doc.text('Low Stock:');
    metrics.lowStock.forEach((p) => doc.text(`- ${p.name} (stock: ${p.stock})`));
    doc.end();
  } else if (format === 'csv') {
    const rows: any[] = [
      ['metric', 'value'],
      ['totalSales', metrics.totalSales],
      ['topProducts', JSON.stringify(metrics.topProducts)],
      ['lowStock', JSON.stringify(metrics.lowStock)],
    ];
    const stringifier = stringify(rows);
    const writable = fs.createWriteStream(filePath);
    stringifier.pipe(writable);
    rows.forEach((r) => stringifier.write(r));
    stringifier.end();
  } else {
    throw new Error('Unsupported format');
  }

  const report = await Report.create({ month, format, url: filePath, userId: userId ?? null });
  return report;
}
