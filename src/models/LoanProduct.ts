import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILoanProduct extends Document {
  name: string;
  code: string;
  interestRate: number;
  interestType: 'flat' | 'declining';
  minAmount: number;
  maxAmount: number;
  minTermMonths: number;
  maxTermMonths: number;
  installmentType: 'Daily' | 'Weekly' | 'Monthly';
  processingFeePercent: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const LoanProductSchema = new Schema<ILoanProduct>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    interestRate: { type: Number, required: true },
    interestType: { type: String, enum: ['flat', 'declining'], default: 'flat' },
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
    minTermMonths: { type: Number, required: true },
    maxTermMonths: { type: Number, required: true },
    installmentType: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly'],
      default: 'Monthly',
    },
    processingFeePercent: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

const LoanProduct: Model<ILoanProduct> =
  mongoose.models.LoanProduct ||
  mongoose.model<ILoanProduct>('LoanProduct', LoanProductSchema);

export default LoanProduct;
