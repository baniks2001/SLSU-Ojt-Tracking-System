import mongoose, { Schema, Document } from 'mongoose';

export interface ICampus extends Document {
  campusName: string;
  campusCode: string;
  location: string;
  address?: string;
  contactEmail?: string;
  contactNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CampusSchema: Schema = new Schema({
  campusName: { type: String, required: true, unique: true },
  campusCode: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  address: { type: String },
  contactEmail: { type: String },
  contactNumber: { type: String },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.models.Campus || mongoose.model<ICampus>('Campus', CampusSchema);
