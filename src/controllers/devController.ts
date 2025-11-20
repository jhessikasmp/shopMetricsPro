import type { Request, Response } from 'express';
import { User } from '../models/user.js';
import { issueTokens } from '../services/auth.js';

export async function login(req: Request, res: Response) {
  const { email } = req.body as any;
  if (!email) return res.status(400).json({ error: 'email required' });
  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await User.create({ email, name: 'Dev User', googleId: null });
  }
  const tokens = await issueTokens(user.id);
  res.json({ userId: user.id, ...tokens });
}
