import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemLog extends Document {
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  userType: 'student' | 'department' | 'admin' | 'superadmin' | 'system';
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  createdAt: Date;
}

const SystemLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  userType: { 
    type: String, 
    enum: ['student', 'department', 'admin', 'superadmin', 'system'],
    required: true 
  },
  action: { type: String, required: true },
  description: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  metadata: { type: Schema.Types.Mixed },
  severity: { 
    type: String, 
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  },
}, {
  timestamps: true,
});

// Index for faster queries
SystemLogSchema.index({ createdAt: -1 });
SystemLogSchema.index({ userType: 1, createdAt: -1 });
SystemLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.models.SystemLog || mongoose.model<ISystemLog>('SystemLog', SystemLogSchema);
