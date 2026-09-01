import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVoucherEntry {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  narration?: string;
}

export interface IVoucher extends Document {
  voucherNo: string;
  date: Date;
  type: 'payment' | 'receipt' | 'journal' | 'contra';
  entries: IVoucherEntry[];
  totalDebit: number;
  totalCredit: number;
  narration: string;
  preparedBy: string;
  approvedBy?: string;
  branch: string;
  status: 'draft' | 'posted' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const VoucherEntrySchema = new Schema<IVoucherEntry>({
  accountCode: { type: String, required: true },
  accountName: { type: String, required: true },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  narration: String,
});

const VoucherSchema = new Schema<IVoucher>(
  {
    voucherNo: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['payment', 'receipt', 'journal', 'contra'],
      required: true,
    },
    entries: [VoucherEntrySchema],
    totalDebit: { type: Number, required: true },
    totalCredit: { type: Number, required: true },
    narration: { type: String, required: true },
    preparedBy: { type: String, required: true },
    approvedBy: String,
    branch: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'posted', 'cancelled'],
      default: 'posted',
    },
  },
  { timestamps: true }
);

const Voucher: Model<IVoucher> =
  mongoose.models.Voucher || mongoose.model<IVoucher>('Voucher', VoucherSchema);

export default Voucher;
