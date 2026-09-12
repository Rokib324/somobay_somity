import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWithdrawalRequest extends Document {
  requestNo: string;
  memberId: mongoose.Types.ObjectId;
  memberName: string;
  memberAccountNo: string;
  accountId: mongoose.Types.ObjectId;
  accountNo: string;
  schemeType: string;
  amount: number;
  availableBalance: number;
  reason: string;
  appliedBy: string;
  date: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvalDate?: Date;
  rejectionReason?: string;
  branch: string;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalRequestSchema = new Schema<IWithdrawalRequest>(
  {
    requestNo: { type: String, required: true, unique: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    memberName: { type: String, required: true },
    memberAccountNo: { type: String, required: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'DepositAccount', required: true },
    accountNo: { type: String, required: true },
    schemeType: { type: String, required: true },
    amount: { type: Number, required: true },
    availableBalance: { type: Number, required: true },
    reason: { type: String, default: 'Personal withdrawal' },
    appliedBy: { type: String, default: 'Teller' },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    approvedBy: String,
    approvalDate: Date,
    rejectionReason: String,
    branch: { type: String, default: 'Main Branch' },
  },
  { timestamps: true }
);

const WithdrawalRequest: Model<IWithdrawalRequest> =
  mongoose.models.WithdrawalRequest ||
  mongoose.model<IWithdrawalRequest>('WithdrawalRequest', WithdrawalRequestSchema);

export default WithdrawalRequest;
