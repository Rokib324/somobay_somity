import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMemberCategory extends Document {
  name: string;
  code: string;
  fee: number;
  minDeposit: number;
  maxLoanLimit: number;
  description?: string;
  activeMembers: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const MemberCategorySchema = new Schema<IMemberCategory>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    fee: { type: Number, default: 500 },
    minDeposit: { type: Number, default: 200 },
    maxLoanLimit: { type: Number, default: 500000 },
    description: { type: String, default: '' },
    activeMembers: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

const MemberCategory: Model<IMemberCategory> =
  mongoose.models.MemberCategory ||
  mongoose.model<IMemberCategory>('MemberCategory', MemberCategorySchema);

export default MemberCategory;
