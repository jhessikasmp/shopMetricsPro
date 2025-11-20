import type { Request, Response } from 'express';
import passport from 'passport';
import { z } from 'zod';
import { issueTokens, rotateRefresh, revokeRefreshToken, revokeAllForUser, hashPassword, verifyPassword } from '../services/auth.js';
import { env, googleOauthDisabled } from '../config/env.js';
import { User } from '../models/user.js';

export function googleStart() {
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && !googleOauthDisabled) {
    return passport.authenticate('google', { scope: ['profile', 'email'] });
  }
  return (_req: Request, res: Response) => res.status(501).json({ error: 'Google OAuth not configured' });
}

export async function googleCallback(req: any, res: Response) {
  const tokens = await issueTokens(req.user.id);
  res.json(tokens);
}

export async function refresh(req: Request, res: Response) {
  const { refresh } = req.body as any;
  if (!refresh) return res.status(400).json({ error: 'Missing refresh token' });
  try {
    const tokens = await rotateRefresh(refresh);
    res.json(tokens);
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}

export async function logout(req: Request, res: Response) {
  const { refresh } = req.body as any;
  if (!refresh) return res.status(400).json({ error: 'Missing refresh token' });
  try {
    await revokeRefreshToken(refresh);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: 'Failed to revoke token' });
  }
}

export async function logoutAll(req: any, res: Response) {
  try {
    await revokeAllForUser(req.userId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to revoke all tokens' });
  }
}

export async function me(req: any, res: Response) {
  res.json({ userId: req.userId });
}

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function signup(req: Request, res: Response) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, name } = parsed.data;
  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, name: name ?? null, googleId: null, passwordHash });
  const tokens = await issueTokens(user.id);
  res.status(201).json({ userId: user.id, ...tokens });
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = await User.findOne({ where: { email } });
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const tokens = await issueTokens(user.id);
  res.json({ userId: user.id, ...tokens });
}
