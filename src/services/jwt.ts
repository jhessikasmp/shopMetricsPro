import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtPayloadBase {
  sub: string; // user id
  type: 'access' | 'refresh';
}

export function signAccess(userId: string) {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_TTL as any };
  return jwt.sign({ sub: userId, type: 'access' } as JwtPayloadBase, env.JWT_ACCESS_SECRET, options);
}

export function signRefresh(userId: string) {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_TTL as any };
  return jwt.sign({ sub: userId, type: 'refresh' } as JwtPayloadBase, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccess(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayloadBase;
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayloadBase;
}
