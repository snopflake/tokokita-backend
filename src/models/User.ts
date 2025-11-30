import mongoose, { Document, Schema } from 'mongoose';
import { encrypt, decrypt } from '../config/security'; // pastikan path benar

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';

  // 🔐 Field terenkripsi
  addressEnc?: string;
  phoneEnc?: string;

  // 🔧 helper methods
  setContactInfo(address: string, phone: string): void;
  getContactInfo(): { address: string; phone: string } | null;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // 🔐 Disimpan terenkripsi
    addressEnc: { type: String, required: false },
    phoneEnc: { type: String, required: false }
  },
  { timestamps: true }
);

// 🔧 Simpan alamat & nomor telepon terenkripsi
UserSchema.methods.setContactInfo = function (address: string, phone: string) {
  this.addressEnc = encrypt(address);
  this.phoneEnc = encrypt(phone);
};

// 🔧 Ambil alamat & nomor telepon dalam bentuk plaintext
UserSchema.methods.getContactInfo = function () {
  if (!this.addressEnc && !this.phoneEnc) return null;

  return {
    address: this.addressEnc ? decrypt(this.addressEnc) : '',
    phone: this.phoneEnc ? decrypt(this.phoneEnc) : ''
  };
};

export const User = mongoose.model<IUser>('User', UserSchema);
