import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
  empId: mongoose.Types.ObjectId;
  empCode: string;
  empName: string;
  date: Date;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Late' | 'Absent' | 'Leave' | 'Holiday';
  workHours?: number;
  notes?: string;
  branch: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    empId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    empCode: { type: String, required: true },
    empName: { type: String, required: true },
    date: { type: Date, required: true },
    checkIn: String,
    checkOut: String,
    status: {
      type: String,
      enum: ['Present', 'Late', 'Absent', 'Leave', 'Holiday'],
      default: 'Present',
    },
    workHours: Number,
    notes: String,
    branch: { type: String, required: true },
  },
  { timestamps: true }
);

AttendanceSchema.index({ empId: 1, date: 1 }, { unique: true });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
