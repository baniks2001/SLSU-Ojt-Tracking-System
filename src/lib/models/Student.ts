import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  course: string;
  department: string;
  location: string;
  hostEstablishment: string;
  contactNumber?: string;
  address?: string;
  ojtAdvisor?: mongoose.Types.ObjectId;
  shiftType: 'regular' | 'graveyard';
  isAccepted: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String },
  course: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  hostEstablishment: { type: String, required: true },
  contactNumber: { type: String },
  address: { type: String },
  ojtAdvisor: { type: Schema.Types.ObjectId, ref: 'Department' },
  shiftType: { 
    type: String, 
    enum: ['regular', 'graveyard'],
    default: 'regular'
  },
  isAccepted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
