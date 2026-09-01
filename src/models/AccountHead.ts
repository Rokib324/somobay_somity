import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAccountHead extends Document {
  code: string;
  name: string;
  group: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  type: 'control' | 'detail';
  parentCode?: string;
  balance: number;
  status: 'active' | 'inactive';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountHeadSchema = new Schema<IAccountHead>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    group: {
      type: String,
      enum: ['Asset', 'Liability', 'Equity', 'Income', 'Expense'],
      required: true,
    },
    type: { type: String, enum: ['control', 'detail'], default: 'detail' },
    parentCode: String,
    balance: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    description: String,
  },
  { timestamps: true }
);

const AccountHead: Model<IAccountHead> =
  mongoose.models.AccountHead ||
  mongoose.model<IAccountHead>('AccountHead', AccountHeadSchema);

export default AccountHead;
