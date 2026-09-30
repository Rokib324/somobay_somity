import mongoose, { Schema, Document, Model } from 'mongoose';

export type ApprovalType =
  | 'member'
  | 'withdrawal'
  | 'loan'
  | 'voucher'
  | 'transaction'
  | 'leave'
  | 'manual_attendance';

/**
 * Workflow stages per type:
 *  - member / withdrawal:          secretary → vice_chairman → chairman
 *  - loan:                         loan_committee_head → director_head → secretary → chairman
 *  - voucher:                      re_committee_head → supervisor_committee_head → secretary → chairman
 *  - leave / manual_attendance:    employer_head → hr_director → chairman
 */
export type ApprovalStage =
  | 'secretary'
  | 'vice_chairman'
  | 'chairman'
  | 'completed'
  | 'loan_committee_head'
  | 'director_head'
  | 're_committee_head'
  | 'supervisor_committee_head'
  | 'employer_head'
  | 'hr_director';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface IApprovalStep {
  stage: ApprovalStage;
  action: 'approved' | 'rejected';
  actionBy: string;
  actionByRole: string;
  actionById?: string;
  notes?: string;
  actionAt: Date;
}

export interface IApproval extends Document {
  approvalNo: string;
  type: ApprovalType;
  title: string;
  description?: string;

  // Source entity reference
  entityId: mongoose.Types.ObjectId;
  entityModel: 'Member' | 'WithdrawalRequest' | 'LoanAccount' | 'Voucher' | 'Collection' | 'Leave' | 'Attendance';
  referenceNo?: string;

  // Member context (if applicable)
  memberId?: mongoose.Types.ObjectId;
  memberName?: string;
  memberAccountNo?: string;

  // Employee context (for Leave / Manual Attendance)
  empId?: mongoose.Types.ObjectId;
  empName?: string;
  empCode?: string;
  department?: string;

  // Financial details (if transaction)
  amount?: number;
  branch: string;

  // Multi-tier workflow state
  status: ApprovalStatus;
  currentStage: ApprovalStage;

  // Step history audit trail
  steps: IApprovalStep[];

  // Rejection details if rejected
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedByRole?: string;
  rejectedAt?: Date;

  // Final approval details
  finalApprovedBy?: string;
  finalApprovedAt?: Date;

  // Submitter details
  submittedBy: string;
  submittedAt: Date;

  // Generic metadata payload (e.g. NID, fatherName, account balance, etc.)
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

const ApprovalStepSchema = new Schema<IApprovalStep>({
  stage: {
    type: String,
    enum: [
      'secretary', 'vice_chairman', 'chairman',
      'loan_committee_head', 'director_head',
      're_committee_head', 'supervisor_committee_head',
      'employer_head', 'hr_director',
    ],
    required: true,
  },
  action: {
    type: String,
    enum: ['approved', 'rejected'],
    required: true,
  },
  actionBy: { type: String, required: true },
  actionByRole: { type: String, required: true },
  actionById: String,
  notes: String,
  actionAt: { type: Date, default: Date.now },
});

const ApprovalSchema = new Schema<IApproval>(
  {
    approvalNo: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['member', 'withdrawal', 'loan', 'voucher', 'transaction', 'leave', 'manual_attendance'],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: String,

    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    entityModel: {
      type: String,
      enum: ['Member', 'WithdrawalRequest', 'LoanAccount', 'Voucher', 'Collection', 'Leave', 'Attendance'],
      required: true,
    },
    referenceNo: { type: String, index: true },

    memberId: { type: Schema.Types.ObjectId, ref: 'Member', index: true },
    memberName: String,
    memberAccountNo: String,

    // Employee fields (Leave / Manual Attendance)
    empId: { type: Schema.Types.ObjectId, ref: 'Employee', index: true },
    empName: String,
    empCode: String,
    department: String,

    amount: { type: Number, default: 0 },
    branch: { type: String, default: 'Main Branch' },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    currentStage: {
      type: String,
      enum: [
        'secretary', 'vice_chairman', 'chairman', 'completed',
        'loan_committee_head', 'director_head',
        're_committee_head', 'supervisor_committee_head',
        'employer_head', 'hr_director',
      ],
      default: 'secretary',
      index: true,
    },

    steps: [ApprovalStepSchema],

    rejectionReason: String,
    rejectedBy: String,
    rejectedByRole: String,
    rejectedAt: Date,

    finalApprovedBy: String,
    finalApprovedAt: Date,

    submittedBy: { type: String, default: 'System' },
    submittedAt: { type: Date, default: Date.now },

    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

ApprovalSchema.index({ currentStage: 1, status: 1 });
ApprovalSchema.index({ type: 1, status: 1 });
ApprovalSchema.index({ createdAt: -1 });

// Ensure clean hot-reloading in Next.js
if (mongoose.models && mongoose.models.Approval) {
  delete (mongoose.models as Record<string, unknown>).Approval;
}

const Approval: Model<IApproval> =
  mongoose.models.Approval || mongoose.model<IApproval>('Approval', ApprovalSchema);

export default Approval;
