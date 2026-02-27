import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordReset extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  token: string;
  tempPassword: string;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const PasswordResetSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  token: { type: String, required: true },
  tempPassword: { type: String, required: true },
  isUsed: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
}, {
  timestamps: true,
});

export default mongoose.models.PasswordReset || mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);
