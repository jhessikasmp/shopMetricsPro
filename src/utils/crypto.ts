import crypto from 'crypto';
import { env } from '../config/env.js';

const ALGO = 'aes-256-ctr';
const KEY = crypto.createHash('sha256').update(env.SHOPIFY_AES_SECRET).digest();
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(payload: string): string {
  const [ivHex, dataHex] = payload.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(dataHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
