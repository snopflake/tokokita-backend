// src/config/security.ts
import crypto from 'crypto';
import { config } from './env';

const ALGORITHM = 'aes-256-cbc';

const KEY = Buffer.from(config.encKey, 'utf8'); // harus 32 byte
const IV = Buffer.from(config.encIv, 'utf8');   // harus 16 byte

export function encrypt(plainText: string): string {
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
  let encrypted = cipher.update(plainText, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

export function decrypt(cipherText: string): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, IV);
  let decrypted = decipher.update(cipherText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
