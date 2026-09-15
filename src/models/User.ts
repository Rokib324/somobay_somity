import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── Cooperative Role Hierarchy ───────────────────────────────────────────────
// New roles for the Somity cooperative structure.
// Legacy roles kept for backward compatibility with existing users.
export type CooperativeRole =
  | 'Chairman'
  | 'Vice Chairman'
  | 'Secretary'
  | 'Treasurer'
  | 'Officer'
  | 'Field Employee';

export type LegacyRole =
  | 'Super Admin'
  | 'Branch Manager'
  | 'Operations In-Charge'
  | 'Teller'
  | 'Back-Office';

export type UserRole = CooperativeRole | LegacyRole;

export const COOPERATIVE_ROLES: CooperativeRole[] = [
  'Chairman',
  'Vice Chairman',
  'Secretary',
  'Treasurer',
  'Officer',
  'Field Employee',
];

export const LEGACY_ROLES: LegacyRole[] = [
  'Super Admin',
  'Branch Manager',
  'Operations In-Charge',
  'Teller',
  'Back-Office',
];

export const ALL_ROLES: UserRole[] = [...COOPERATIVE_ROLES, ...LEGACY_ROLES];

// ─── User Interface ───────────────────────────────────────────────────────────
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  employeeId?: string;
  role: UserRole;
  branch: string;
  status: 'Active' | 'Inactive' | 'Locked';
  transactionLimit: number;
  permissions: string[];
  /** User-level menu slug overrides merged on top of role defaults */
  menuPrivileges: string[];
  failedLoginAttempts: number;
  lockedUntil?: Date;
  lastLogin?: Date;
  passwordChangedAt?: Date;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    employeeId: { type: String, unique: true, sparse: true },
    role: {
      type: String,
      enum: ALL_ROLES,
      default: 'Field Employee',
    },
    branch: { type: String, required: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Locked'],
      default: 'Active',
    },
    transactionLimit: { type: Number, default: 50000 },
    permissions: [{ type: String }],
    menuPrivileges: [{ type: String }],
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    lastLogin: { type: Date },
    passwordChangedAt: { type: Date },
    mustChangePassword: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── Password Hashing ─────────────────────────────────────────────────────────
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
});

UserSchema.methods.comparePassword = async function (
  plain: string
): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

// ─── Hot-reload safety ────────────────────────────────────────────────────────
if (mongoose.models && mongoose.models.User) {
  delete (mongoose.models as Record<string, unknown>).User;
}

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
