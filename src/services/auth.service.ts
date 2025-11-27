// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { signToken } from '../utils/jwt';

export async function registerUser(fullName: string, email: string, password: string) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,        
    email,
    passwordHash,
    role: 'user',
  });

  const token = signToken({ userId: user._id.toString(), role: user.role });
  return { user, token };
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new Error('Invalid email or password');
  }

  const token = signToken({ userId: user._id.toString(), role: user.role });
  return { user, token };
}
