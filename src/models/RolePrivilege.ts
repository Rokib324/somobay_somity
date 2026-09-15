/**
 * RolePrivilege.ts
 * Pivot model mapping a cooperative role to its authorized menu slugs.
 * One document per role; updated only by Chairman via PUT /api/rbac/roles.
 */
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRolePrivilege extends Document {
  role: string;                  // e.g. "Chairman", "Officer"
  menuSlugs: string[];           // e.g. ["dashboard","members","loans-apply"]
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RolePrivilegeSchema = new Schema<IRolePrivilege>(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    menuSlugs: {
      type: [String],
      default: [],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Clear cached model in Next.js dev hot-reload
if (mongoose.models && mongoose.models.RolePrivilege) {
  delete (mongoose.models as Record<string, unknown>).RolePrivilege;
}

const RolePrivilege: Model<IRolePrivilege> =
  mongoose.models.RolePrivilege ||
  mongoose.model<IRolePrivilege>('RolePrivilege', RolePrivilegeSchema);

export default RolePrivilege;
