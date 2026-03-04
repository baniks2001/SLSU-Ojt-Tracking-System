import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  courseCode: string;
  courseName: string;
  departmentId: mongoose.Types.ObjectId;
  departmentName: string; // Kept for backward compatibility
  description?: string;
  totalHours: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema({
  courseCode: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  departmentName: { type: String, required: true }, // Denormalized for quick access
  description: { type: String },
  totalHours: { type: Number, default: 500 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
