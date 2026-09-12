import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction {
  date: Date;
  type: 'deposit' | 'withdrawal' | 'interest';
  amount: number;
  balance: number;
  reference?: string;
  collectedBy?: string;
  notes?: string;
}

export interface IDepositAccount extends Document {
  accountNo: string;
  memberId: mongoose.Types.ObjectId;
  memberName: string;
  type: string;
  amount: number; // per installment or deposit amount
  interestRate: number;
  termMonths?: number;
  openingDate: Date;
  maturityDate?: Date;
  status: 'active' | 'matured' | 'closed';
  balance: number;
  transactions: ITransaction[];
  branch: string;
  category?: string;
  percentage?: number;
  priority?: 'High' | 'Medium' | 'Low' | 'Normal';
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['deposit', 'withdrawal', 'interest'], required: true },
  amount: { type: Number, required: true },
  balance: { type: Number, required: true },
  reference: String,
  collectedBy: String,
  notes: String,
});

const DepositAccountSchema = new Schema<IDepositAccount>(
  {
    accountNo: { type: String, required: true, unique: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    memberName: { type: String, required: true },
    type: {
      type: String,
      required: true,
    },
    amount: { type: Number, required: true },
    interestRate: { type: Number, required: true, default: 0 },
    termMonths: Number,
    openingDate: { type: Date, default: Date.now },
    maturityDate: Date,
    status: { type: String, enum: ['active', 'matured', 'closed'], default: 'active' },
    balance: { type: Number, default: 0 },
    transactions: [TransactionSchema],
    branch: { type: String, required: true },
    category: { type: String, default: 'General' },
    percentage: { type: Number, default: 0 },
    priority: { type: String, enum: ['High', 'Medium', 'Low', 'Normal'], default: 'Normal' },
  },
  { timestamps: true }
);

const DepositAccount: Model<IDepositAccount> =
  mongoose.models.DepositAccount ||
  mongoose.model<IDepositAccount>('DepositAccount', DepositAccountSchema);

export default DepositAccount;
