import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  department?: mongoose.Types.ObjectId;
  postedBy: mongoose.Types.ObjectId;
  isForAll: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isForAll: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
