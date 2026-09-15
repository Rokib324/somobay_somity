import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInstallment {
  dueDate: Date;
  principal: number;
  interest: number;
  total: number;
  paidAmount: number;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
}

export interface ILoanAccount extends Document {
  loanNo: string;
  memberId: mongoose.Types.ObjectId;
  memberName: string;
  productId: mongoose.Types.ObjectId;
  productName: string;
  principalAmount: number;
  interestRate: number;
  interestAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  installments: number;
  installmentAmount: number;
  installmentType: 'Daily' | 'Weekly' | 'Monthly';
  applicationDate: Date;
  disbursementDate?: Date;
  closingDate?: Date;
  status: 'pending_approval' | 'approved' | 'disbursed' | 'active' | 'closed' | 'rejected' | 'overdue';
  approvedBy?: string;
  disbursedBy?: string;
  branch: string;
  purpose?: string;
  guarantorMemberId?: mongoose.Types.ObjectId;
  guarantorAccountNo?: string;
  guarantorName?: string;
  guarantorNid?: string;
  guarantorPhone?: string;
  guarantorRelation?: string;
  guarantorPhoto?: string;
  guarantorSignature?: string;
  schedule: IInstallment[];
  createdAt: Date;
  updatedAt: Date;
}

const InstallmentSchema = new Schema<IInstallment>({
  dueDate: { type: Date, required: true },
  principal: { type: Number, required: true },
  interest: { type: Number, required: true },
  total: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  paidDate: Date,
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'partial'],
    default: 'pending',
  },
});

const LoanAccountSchema = new Schema<ILoanAccount>(
  {
    loanNo: { type: String, required: true, unique: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    memberName: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'LoanProduct', required: true },
    productName: { type: String, required: true },
    principalAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    interestAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, required: true },
    installments: { type: Number, required: true },
    installmentAmount: { type: Number, required: true },
    installmentType: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly'],
      default: 'Monthly',
    },
    applicationDate: { type: Date, default: Date.now },
    disbursementDate: Date,
    closingDate: Date,
    status: {
      type: String,
      enum: ['pending_approval', 'approved', 'disbursed', 'active', 'closed', 'rejected', 'overdue'],
      default: 'pending_approval',
    },
    approvedBy: String,
    disbursedBy: String,
    branch: { type: String, required: true },
    purpose: String,
    guarantorMemberId: { type: Schema.Types.ObjectId, ref: 'Member' },
    guarantorAccountNo: String,
    guarantorName: String,
    guarantorNid: String,
    guarantorPhone: String,
    guarantorRelation: String,
    guarantorPhoto: String,
    guarantorSignature: String,
    schedule: [InstallmentSchema],
  },
  { timestamps: true }
);

LoanAccountSchema.index({ memberName: 'text', loanNo: 'text' });

delete (mongoose.models as Record<string, unknown>).LoanAccount;
const LoanAccount: Model<ILoanAccount> =
  mongoose.models.LoanAccount ||
  mongoose.model<ILoanAccount>('LoanAccount', LoanAccountSchema);

export default LoanAccount;
