import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INominee {
  name: string;
  relation: string;
  nid?: string;
  phone?: string;
  percentage: number;
}

export interface IMember extends Document {
  accountNo: string;
  name: string;
  fatherName: string;
  motherName: string;
  spouseName?: string;
  dateOfBirth?: Date;
  mobile: string;
  phone?: string;
  nid: string;
  category: string;
  branch: string;
  joinDate: Date;
  address: string;
  photo?: string;
  status: 'active' | 'inactive' | 'pending';
  totalDeposit: number;
  totalLoan: number;
  nominee?: INominee;
  createdAt: Date;
  updatedAt: Date;
}

const NomineeSchema = new Schema<INominee>({
  name: { type: String, required: true },
  relation: { type: String, required: true },
  nid: String,
  phone: String,
  percentage: { type: Number, default: 100 },
});

const MemberSchema = new Schema<IMember>(
  {
    accountNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    spouseName: String,
    dateOfBirth: Date,
    mobile: { type: String, required: true },
    phone: String,
    nid: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    branch: { type: String, required: true },
    joinDate: { type: Date, default: Date.now },
    address: { type: String, default: '' },
    photo: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending',
    },
    totalDeposit: { type: Number, default: 0 },
    totalLoan: { type: Number, default: 0 },
    nominee: NomineeSchema,
  },
  { timestamps: true }
);

MemberSchema.index({ name: 'text', accountNo: 'text', mobile: 'text', nid: 'text' });

const Member: Model<IMember> =
  mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);

export default Member;
