import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  date: Date;
  morningIn?: Date;
  morningOut?: Date;
  afternoonIn?: Date;
  afternoonOut?: Date;
  eveningIn?: Date;
  eveningOut?: Date;
  morningInImage?: string;
  morningOutImage?: string;
  afternoonInImage?: string;
  afternoonOutImage?: string;
  eveningInImage?: string;
  eveningOutImage?: string;
  shiftType: 'regular' | 'graveyard';
  totalHours: number;
  undertimeMinutes: number;
  status: 'present' | 'absent' | 'late' | 'half_day';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: Date, required: true },
  morningIn: { type: Date },
  morningOut: { type: Date },
  afternoonIn: { type: Date },
  afternoonOut: { type: Date },
  eveningIn: { type: Date },
  eveningOut: { type: Date },
  morningInImage: { type: String },
  morningOutImage: { type: String },
  afternoonInImage: { type: String },
  afternoonOutImage: { type: String },
  eveningInImage: { type: String },
  eveningOutImage: { type: String },
  shiftType: { 
    type: String, 
    enum: ['regular', 'graveyard'],
    default: 'regular'
  },
  totalHours: { type: Number, default: 0 },
  undertimeMinutes: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'half_day'],
    default: 'present'
  },
  remarks: { type: String },
}, {
  timestamps: true,
});

AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
