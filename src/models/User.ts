import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole =
  | 'Super Admin'
  | 'Branch Manager'
  | 'Operations In-Charge'
  | 'Teller'
  | 'Back-Office';

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
  failedLoginAttempts: number;
  lockedUntil?: Date;
  lastLogin?: Date;
  passwordChangedAt?: Date;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    employeeId: { type: String, unique: true, sparse: true },
    role: {
      type: String,
      enum: ['Super Admin', 'Branch Manager', 'Operations In-Charge', 'Teller', 'Back-Office'],
      default: 'Teller',
    },
    branch: { type: String, required: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Locked'],
      default: 'Active',
    },
    transactionLimit: { type: Number, default: 50000 },
    permissions: [{ type: String }],
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    lastLogin: { type: Date },
    passwordChangedAt: { type: Date },
    mustChangePassword: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
});

UserSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

if (mongoose.models && mongoose.models.User) {
  delete mongoose.models.User;
}

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
