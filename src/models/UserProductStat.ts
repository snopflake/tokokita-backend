// src/models/UserProductStat.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUserProductStat extends Document {
  userKey: string; // userId atau "session:<sessionId>"
  productId: mongoose.Types.ObjectId;
  score: number;
  lastActionAt: Date;
}

const UserProductStatSchema = new Schema<IUserProductStat>(
  {
    userKey: { type: String, required: true, index: true },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    score: { type: Number, default: 0 },
    lastActionAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserProductStatSchema.index({ userKey: 1, score: -1 });

export const UserProductStat = mongoose.model<IUserProductStat>(
  'UserProductStat',
  UserProductStatSchema
);
