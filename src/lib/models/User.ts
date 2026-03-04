import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  accountType: 'student' | 'department' | 'admin' | 'superadmin' | 'supervisor';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  supervisorData?: {
    firstName: string;
    lastName: string;
    contactNumber?: string;
    departmentId: string;
  };
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountType: { 
    type: String, 
    enum: ['student', 'department', 'admin', 'superadmin', 'supervisor'],
    required: true 
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  supervisorData: {
    firstName: { type: String },
    lastName: { type: String },
    contactNumber: { type: String },
    departmentId: { type: String },
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
