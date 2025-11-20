// src/config/env.ts
import * as dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  mongoUri: requireEnv('MONGO_URI'),

  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',

  // ini opsional, jadi nggak pakai requireEnv
  rabbitUrl: process.env.RABBITMQ_URL || '',
  midtransApiKey: process.env.MIDTRANS_API_KEY || '',

  encKey: requireEnv('ENCRYPTION_KEY'),
  encIv: requireEnv('ENCRYPTION_IV')
};
