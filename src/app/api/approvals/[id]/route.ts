import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getSessionUserFromRequest } from '@/lib/auth';
import Approval from '@/models/Approval';
import Member from '@/models/Member';
import WithdrawalRequest from '@/models/WithdrawalRequest';
import DepositAccount from '@/models/DepositAccount';
import Collection from '@/models/Collection';
import LoanAccount from '@/models/LoanAccount';
import Voucher from '@/models/Voucher';
import Leave from '@/models/Leave';
import Attendance from '@/models/Attendance';

const ALLOWED_ROLES = [
  'Secretary', 'Vice Chairman', 'Chairman', 'Super Admin',
  'Loan Committee Head', 'Director Head',
  'Re-committee Head', 'Supervisor Committee Head',
  'Employer Head', 'Supervisor', 'HR Director', 'HR', 'Director',
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUserFromRequest(req);
    if (!sessionUser || !ALLOWED_ROLES.includes(sessionUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const approval = await Approval.findById(id).lean();

    if (!approval) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 });
    }

    let entityData: Record<string, any> | null = null;
    if (approval.entityModel === 'Member') {
      entityData = await Member.findById(approval.entityId).lean();
    } else if (approval.entityModel === 'WithdrawalRequest') {
      entityData = await WithdrawalRequest.findById(approval.entityId).lean();
    } else if (approval.entityModel === 'LoanAccount') {
      entityData = await LoanAccount.findById(approval.entityId).lean();
    } else if (approval.entityModel === 'Voucher') {
      entityData = await Voucher.findById(approval.entityId).lean();
    } else if (approval.entityModel === 'Leave') {
      entityData = await Leave.findById(approval.entityId).lean();
    } else if (approval.entityModel === 'Attendance') {
      entityData = await Attendance.findById(approval.entityId).lean();
    }

    return NextResponse.json({ approval, entityData });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch approval';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * Stage transitions per approval type:
 * Member/Withdrawal:    secretary -> vice_chairman -> chairman -> completed
 * Loan:                 loan_committee_head -> director_head -> secretary -> chairman -> completed
 * Voucher:              re_committee_head -> supervisor_committee_head -> secretary -> chairman -> completed
 * Leave/Attendance:     employer_head -> hr_director -> chairman -> completed
 */
const STAGE_TRANSITIONS: Record<string, { next: string; allowedRole: string[] }> = {
  'secretary':                 { next: 'vice_chairman',             allowedRole: ['Secretary'] },
  'vice_chairman':             { next: 'chairman',                  allowedRole: ['Vice Chairman'] },
  'chairman':                  { next: 'completed',                 allowedRole: ['Chairman', 'Super Admin'] },
  'loan_committee_head':       { next: 'director_head',             allowedRole: ['Loan Committee Head'] },
  'director_head':             { next: 'secretary',                 allowedRole: ['Director Head'] },
  're_committee_head':         { next: 'supervisor_committee_head', allowedRole: ['Re-committee Head'] },
  'supervisor_committee_head': { next: 'secretary',                 allowedRole: ['Supervisor Committee Head'] },
  'employer_head':             { next: 'hr_director',               allowedRole: ['Employer Head', 'Supervisor'] },
  'hr_director':               { next: 'chairman',                  allowedRole: ['HR Director', 'HR', 'Director'] },
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUserFromRequest(req);
    if (!sessionUser || !ALLOWED_ROLES.includes(sessionUser.role)) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to perform approvals.' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { action, notes } = body;

    if (!action || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: 'Valid action (approved/rejected) required' }, { status: 400 });
    }

    const approval = await Approval.findById(id);
    if (!approval) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 });
    }

    if (approval.status === 'approved' || approval.status === 'rejected') {
      return NextResponse.json({ error: `This request has already been ${approval.status}.` }, { status: 400 });
    }

    const currentStage = approval.currentStage as string;
    const transition = STAGE_TRANSITIONS[currentStage];

    if (!transition) {
      return NextResponse.json({ error: `Invalid workflow stage: ${currentStage}` }, { status: 400 });
    }

    if (!transition.allowedRole.includes(sessionUser.role)) {
      return NextResponse.json(
        { error: `Stage "${currentStage}" must be actioned by: ${transition.allowedRole.join(' or ')}. Your role (${sessionUser.role}) is not authorized at this stage.` },
        { status: 403 }
      );
    }

    const roleLabel = sessionUser.role;

    if (action === 'rejected') {
      if (!notes || !notes.trim()) {
        return NextResponse.json({ error: 'Rejection reason is required.' }, { status: 400 });
      }
      approval.status = 'rejected';
      approval.rejectionReason = notes;
      approval.rejectedBy = sessionUser.name;
      approval.rejectedByRole = roleLabel;
      approval.rejectedAt = new Date();
      approval.steps.push({
        stage: currentStage as any, action: 'rejected',
        actionBy: sessionUser.name, actionByRole: roleLabel, actionById: sessionUser.id,
        notes, actionAt: new Date(),
      });
      await terminateUnderlyingEntity(approval, notes);
      await approval.save();
      return NextResponse.json({ success: true, message: `Request rejected by ${roleLabel}. Workflow terminated.`, approval });
    }

    // Approved
    approval.steps.push({
      stage: currentStage as any, action: 'approved',
      actionBy: sessionUser.name, actionByRole: roleLabel, actionById: sessionUser.id,
      notes: notes || `Approved by ${roleLabel}`, actionAt: new Date(),
    });

    const nextStage = transition.next;

    if (nextStage === 'completed') {
      approval.status = 'approved';
      approval.currentStage = 'completed';
      approval.finalApprovedBy = sessionUser.name;
      approval.finalApprovedAt = new Date();
      await executeFinalApprovalEffects(approval, sessionUser.name);
      await approval.save();
      return NextResponse.json({ success: true, message: 'Final approval granted. All actions executed!', approval });
    } else {
      approval.currentStage = nextStage as any;
      await approval.save();
      const stageLabel = nextStage.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
      return NextResponse.json({ success: true, message: `Approved by ${roleLabel}. Advanced to: ${stageLabel}.`, approval });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to process approval action';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function terminateUnderlyingEntity(approval: any, reason: string) {
  try {
    if (approval.type === 'member') {
      await Member.findByIdAndUpdate(approval.entityId, { status: 'inactive' });
    } else if (approval.type === 'withdrawal') {
      await WithdrawalRequest.findByIdAndUpdate(approval.entityId, { status: 'Rejected', rejectionReason: reason });
    } else if (approval.type === 'loan') {
      await LoanAccount.findByIdAndUpdate(approval.entityId, { status: 'rejected' });
    } else if (approval.type === 'voucher' || approval.type === 'transaction') {
      await Voucher.findByIdAndUpdate(approval.entityId, { status: 'cancelled' });
    } else if (approval.type === 'leave') {
      await Leave.findByIdAndUpdate(approval.entityId, { status: 'rejected', notes: reason });
    } else if (approval.type === 'manual_attendance') {
      await Attendance.findByIdAndUpdate(approval.entityId, { notes: `Rejected: ${reason}` });
    }
  } catch (err) {
    console.error('Error terminating underlying entity:', err);
  }
}

async function executeFinalApprovalEffects(approval: any, approvedByName: string) {
  try {
    if (approval.type === 'member') {
      await Member.findByIdAndUpdate(approval.entityId, { status: 'active' });
    } else if (approval.type === 'withdrawal') {
      const request = await WithdrawalRequest.findById(approval.entityId);
      if (request && request.status !== 'Approved') {
        const account = await DepositAccount.findById(request.accountId);
        if (account && account.balance >= request.amount) {
          account.balance -= request.amount;
          account.transactions = account.transactions || [];
          account.transactions.push({
            date: new Date(), type: 'withdrawal', amount: request.amount,
            balance: account.balance, reference: request.requestNo,
            notes: `Executive approved withdrawal: ${request.reason}`, collectedBy: approvedByName,
          });
          await account.save();
          const member = await Member.findById(request.memberId);
          if (member) { member.totalDeposit = Math.max(0, (member.totalDeposit || 0) - request.amount); await member.save(); }
          await Collection.create({
            date: new Date(), memberId: request.memberId, memberName: request.memberName,
            accountNo: request.accountNo, branch: request.branch, type: 'withdrawal',
            accountId: request.accountId, amount: request.amount, collectedBy: approvedByName,
            reference: request.requestNo, notes: request.reason,
          });
          request.status = 'Approved';
          request.approvedBy = approvedByName;
          request.approvalDate = new Date();
          await request.save();
        }
      }
    } else if (approval.type === 'loan') {
      await LoanAccount.findByIdAndUpdate(approval.entityId, { status: 'approved', approvedBy: approvedByName });
    } else if (approval.type === 'voucher' || approval.type === 'transaction') {
      await Voucher.findByIdAndUpdate(approval.entityId, { status: 'posted', approvedBy: approvedByName });
    } else if (approval.type === 'leave') {
      await Leave.findByIdAndUpdate(approval.entityId, { status: 'approved', approvedBy: approvedByName, approvalDate: new Date() });
    } else if (approval.type === 'manual_attendance') {
      await Attendance.findByIdAndUpdate(approval.entityId, { notes: `Manually approved by ${approvedByName} on ${new Date().toLocaleDateString()}` });
    }
  } catch (err) {
    console.error('Error executing final approval effects:', err);
  }
}
