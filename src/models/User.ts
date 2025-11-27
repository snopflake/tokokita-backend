import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  fullName: string; 
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true }, 
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
