import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  outcome: 'success' | 'failure' | 'blocked';
  details?: string;
  ip?: string;
  userAgent?: string;
  branch?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: String },
    userEmail: { type: String },
    userRole: { type: String },
    action: { type: String, required: true },
    resource: { type: String },
    resourceId: { type: String },
    outcome: {
      type: String,
      enum: ['success', 'failure', 'blocked'],
      required: true,
    },
    details: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    branch: { type: String },
  },
  { timestamps: true }
);

// TTL index: auto-delete audit logs after 365 days
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
// Query indexes
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ outcome: 1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
