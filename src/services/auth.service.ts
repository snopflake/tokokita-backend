// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { signToken } from '../utils/jwt';

// address & phone dibuat optional supaya tidak merusak client lama
export async function registerUser(
  fullName: string,
  email: string,
  password: string,
  address?: string,
  phone?: string
) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // buat user dulu
  const user = new User({
    fullName,
    email,
    passwordHash,
    role: 'user',
  });

  // kalau address & phone ada di body → simpan terenkripsi
  if (address && phone) {
    user.setContactInfo(address, phone);
  }

  await user.save();

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
