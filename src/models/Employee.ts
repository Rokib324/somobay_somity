import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmployee extends Document {
  empId: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email?: string;
  nid?: string;
  address?: string;
  joinDate: Date;
  salary: number;
  branch: string;
  status: 'active' | 'on_leave' | 'terminated';
  bankAccount?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    empId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    nid: String,
    address: String,
    joinDate: { type: Date, default: Date.now },
    salary: { type: Number, required: true },
    branch: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'on_leave', 'terminated'],
      default: 'active',
    },
    bankAccount: String,
  },
  { timestamps: true }
);

const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;
