import mongoose, { Schema, Document } from 'mongoose';

export interface IScheduleChangeRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  currentShiftType: string;
  requestedShiftType: string;
  requestedShiftConfig: {
    type: string;
    morningStart?: string;
    morningEnd?: string;
    afternoonStart?: string;
    afternoonEnd?: string;
    eveningStart?: string;
    eveningEnd?: string;
    description?: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  comments?: string;
}

const ScheduleChangeRequestSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  currentShiftType: { type: String, required: true },
  requestedShiftType: { type: String, required: true },
  requestedShiftConfig: {
    type: { type: String },
    morningStart: { type: String },
    morningEnd: { type: String },
    afternoonStart: { type: String },
    afternoonEnd: { type: String },
    eveningStart: { type: String },
    eveningEnd: { type: String },
    description: { type: String },
  },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  requestedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  comments: { type: String },
}, {
  timestamps: true,
});

export default mongoose.models.ScheduleChangeRequest || 
  mongoose.model<IScheduleChangeRequest>('ScheduleChangeRequest', ScheduleChangeRequestSchema);
