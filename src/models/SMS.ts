import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISMS extends Document {
  recipient: string;
  phone: string;
  message: string;
  type: 'Transaction' | 'Notification' | 'Bulk' | 'OTP';
  status: 'Delivered' | 'Failed' | 'Pending';
  sentBy?: string;
  branch?: string;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SMSSchema = new Schema<ISMS>(
  {
    recipient: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['Transaction', 'Notification', 'Bulk', 'OTP'],
      default: 'Notification',
    },
    status: {
      type: String,
      enum: ['Delivered', 'Failed', 'Pending'],
      default: 'Pending',
    },
    sentBy: String,
    branch: String,
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

SMSSchema.index({ sentAt: -1 });

const SMS: Model<ISMS> =
  mongoose.models.SMS || mongoose.model<ISMS>('SMS', SMSSchema);

export default SMS;
