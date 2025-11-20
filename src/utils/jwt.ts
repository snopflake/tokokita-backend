// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthTokenPayload {
  userId: string;
  role: 'user' | 'admin';
}

// pastikan secret berupa string
const JWT_SECRET = config.jwtSecret as string;

// Dibungkus ke any supaya TypeScript tidak rewel di .sign() dan .verify()
const jwtAny: any = jwt;

export function signToken(payload: AuthTokenPayload): string {
  return jwtAny.sign(payload, JWT_SECRET, {
    expiresIn: config.jwtExpiresIn
  }) as string;
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwtAny.verify(token, JWT_SECRET) as AuthTokenPayload;
}
