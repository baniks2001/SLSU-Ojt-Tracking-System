import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  userId: mongoose.Types.ObjectId;
  departmentName: string;
  departmentCode: string;
  location: string;
  contactEmail: string;
  contactNumber?: string;
  ojtAdvisorName: string;
  ojtAdvisorPosition: string;
  isActive: boolean;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  departmentName: { type: String, required: true },
  departmentCode: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactNumber: { type: String },
  ojtAdvisorName: { type: String, required: true },
  ojtAdvisorPosition: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isAccepted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

export default mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);
