import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { generateReport } from '../services/report.js';
import { Report } from '../models/report.js';

const genSchema = z.object({ month: z.string().regex(/^\d{4}-\d{2}$/), format: z.enum(['pdf', 'csv']) });

export async function generate(req: any, res: Response) {
  const parsed = genSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const rpt = await generateReport(parsed.data.month, parsed.data.format, req.userId ?? null);
    res.json({ id: rpt.id, month: rpt.month, format: rpt.format, url: rpt.url });
  } catch {
    res.status(500).json({ error: 'Failed to generate report' });
  }
}

export async function download(req: any, res: Response) {
  const rpt = await Report.findByPk(req.params.id);
  if (!rpt) return res.status(404).json({ error: 'Report not found' });
  if (!rpt.userId || rpt.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  // Ensure path stays within reports directory
  const expectedDir = path.resolve(path.join(process.cwd(), 'reports'));
  const resolved = path.resolve(rpt.url);
  if (!resolved.startsWith(expectedDir)) return res.status(400).json({ error: 'Invalid report path' });
  if (!fs.existsSync(rpt.url)) return res.status(410).json({ error: 'File missing' });
  res.download(rpt.url);
}
