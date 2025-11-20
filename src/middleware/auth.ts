import type { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../services/jwt.js';

export interface AuthRequest extends Request { userId?: string }

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = auth.replace(/^Bearer\s+/i, '');
  try {
    const payload = verifyAccess(token);
    req.userId = payload.sub;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
