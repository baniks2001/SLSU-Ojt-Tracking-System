import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  courseCode: string;
  courseName: string;
  departmentName: string; // Name of the department offering this course
  description?: string;
  totalHours: number; // Total hours required to complete OJT
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema({
  courseCode: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  departmentName: { type: String, required: true },
  description: { type: String },
  totalHours: { type: Number, default: 500 }, // Total hours required for OJT
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
