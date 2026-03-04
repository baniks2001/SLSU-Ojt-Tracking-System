import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  courseCode: string;
  courseName: string;
  departmentName: string; // Name of the department offering this course
  campusId: mongoose.Types.ObjectId; // Reference to the campus
  description?: string;
  totalHours: number; // Total hours required to complete OJT
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema({
  courseCode: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  departmentName: { type: String, required: true }, // Name of the department
  campusId: { type: Schema.Types.ObjectId, ref: 'Campus', required: true }, // Reference to campus
  description: { type: String },
  totalHours: { type: Number, default: 500 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
