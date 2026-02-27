import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  courseCode: string;
  courseName: string;
  departmentId: mongoose.Types.ObjectId;
  description?: string;
  duration: string; // e.g., "4 years", "2 years"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema({
  courseCode: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  description: { type: String },
  duration: { type: String, default: '4 years' },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
