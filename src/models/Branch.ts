import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBranch extends Document {
  code: string;
  name: string;
  manager: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  totalMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    manager: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    totalMembers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Branch: Model<IBranch> =
  mongoose.models.Branch || mongoose.model<IBranch>('Branch', BranchSchema);

export default Branch;
