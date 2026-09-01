import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeave extends Document {
  empId: mongoose.Types.ObjectId;
  empCode: string;
  empName: string;
  leaveType: 'Annual' | 'Sick' | 'Casual' | 'Maternity' | 'Unpaid';
  fromDate: Date;
  toDate: Date;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: Date;
  notes?: string;
  branch: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
  {
    empId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    empCode: { type: String, required: true },
    empName: { type: String, required: true },
    leaveType: {
      type: String,
      enum: ['Annual', 'Sick', 'Casual', 'Maternity', 'Unpaid'],
      required: true,
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: String,
    approvalDate: Date,
    notes: String,
    branch: { type: String, required: true },
  },
  { timestamps: true }
);

const Leave: Model<ILeave> =
  mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema);

export default Leave;
