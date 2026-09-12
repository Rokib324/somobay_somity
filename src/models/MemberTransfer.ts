import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMemberTransfer extends Document {
  transferType: 'Amount Transfer' | 'Account Ownership Transfer';
  sourceMemberId: mongoose.Types.ObjectId;
  sourceMemberName: string;
  sourceAccountNo: string;
  targetMemberId: mongoose.Types.ObjectId;
  targetMemberName: string;
  targetAccountNo?: string;
  amount: number;
  reason: string;
  transferredBy?: string;
  date: Date;
  status: 'Completed' | 'Pending' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const MemberTransferSchema = new Schema<IMemberTransfer>(
  {
    transferType: {
      type: String,
      enum: ['Amount Transfer', 'Account Ownership Transfer'],
      required: true,
    },
    sourceMemberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    sourceMemberName: { type: String, required: true },
    sourceAccountNo: { type: String, required: true },
    targetMemberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    targetMemberName: { type: String, required: true },
    targetAccountNo: String,
    amount: { type: Number, default: 0 },
    reason: { type: String, required: true },
    transferredBy: { type: String, default: 'System Operator' },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Rejected'],
      default: 'Completed',
    },
  },
  { timestamps: true }
);

const MemberTransfer: Model<IMemberTransfer> =
  mongoose.models.MemberTransfer ||
  mongoose.model<IMemberTransfer>('MemberTransfer', MemberTransferSchema);

export default MemberTransfer;
