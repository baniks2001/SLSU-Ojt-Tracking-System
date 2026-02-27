import mongoose, { Schema, Document } from 'mongoose';

// Shift configuration interface
export interface ShiftConfig {
  type: 'regular' | 'regular-split' | 'graveyard' | 'custom';
  morningStart?: string; // HH:mm format (e.g., "07:00")
  morningEnd?: string;
  afternoonStart?: string;
  afternoonEnd?: string;
  eveningStart?: string; // For graveyard shift
  eveningEnd?: string;
  description?: string;
}

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  courseId: mongoose.Types.ObjectId;
  department: string; // Department name (derived from course)
  hostEstablishment: string;
  contactNumber?: string;
  emergencyContact?: string;
  emergencyContactNumber?: string;
  address?: string;
  ojtAdvisor?: mongoose.Types.ObjectId;
  shiftType: 'regular' | 'regular-split' | 'graveyard' | 'custom';
  shiftConfig?: ShiftConfig;
  isAccepted: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShiftConfigSchema: Schema = new Schema({
  type: { type: String, enum: ['regular', 'regular-split', 'graveyard', 'custom'] },
  morningStart: { type: String }, // HH:mm format
  morningEnd: { type: String },
  afternoonStart: { type: String },
  afternoonEnd: { type: String },
  eveningStart: { type: String },
  eveningEnd: { type: String },
  description: { type: String },
}, { _id: false });

const StudentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  department: { type: String, required: true }, // Department name from course
  hostEstablishment: { type: String, required: true },
  contactNumber: { type: String },
  emergencyContact: { type: String },
  emergencyContactNumber: { type: String },
  address: { type: String },
  ojtAdvisor: { type: Schema.Types.ObjectId, ref: 'Department' },
  shiftType: { 
    type: String, 
    enum: ['regular', 'regular-split', 'graveyard', 'custom'],
    default: 'regular'
  },
  shiftConfig: { type: ShiftConfigSchema },
  isAccepted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
