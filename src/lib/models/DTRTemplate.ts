import mongoose, { Schema, Document } from 'mongoose';

export interface IDTRTemplate extends Document {
  templateName: string;
  description?: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  extractedData?: {
    name?: string;
    month?: string;
    year?: string;
    days?: Array<{
      day: number;
      amArrival?: string;
      amDeparture?: string;
      pmArrival?: string;
      pmDeparture?: string;
      undertime?: string;
    }>;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DTRTemplateSchema: Schema = new Schema({
  templateName: { type: String, required: true },
  description: { type: String },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  filePath: { type: String, required: true },
  extractedData: {
    name: { type: String },
    month: { type: String },
    year: { type: String },
    days: [{
      day: { type: Number },
      amArrival: { type: String },
      amDeparture: { type: String },
      pmArrival: { type: String },
      pmDeparture: { type: String },
      undertime: { type: String },
    }],
  },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.models.DTRTemplate || mongoose.model<IDTRTemplate>('DTRTemplate', DTRTemplateSchema);
