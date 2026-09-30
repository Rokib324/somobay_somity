import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getSessionUserFromRequest } from '@/lib/auth';
import Approval, { ApprovalStage, ApprovalType } from '@/models/Approval';
import Member from '@/models/Member';
import WithdrawalRequest from '@/models/WithdrawalRequest';
import LoanAccount from '@/models/LoanAccount';
import Voucher from '@/models/Voucher';
import Leave from '@/models/Leave';

/**
 * Role → Stage mapping.
 * Each role can act on items whose currentStage matches their designated stage.
 *
 * Member / Withdrawal: Secretary → Vice Chairman → Chairman
 * Loan:                Loan Committee Head → Director Head → Secretary → Chairman
 * Voucher:             Re-committee Head → Supervisor Committee Head → Secretary → Chairman
 * Leave / Attendance:  Employer Head (or Supervisor) → HR Director → Chairman
 */
const ROLE_STAGE_MAP: Record<string, ApprovalStage[]> = {
  'Secretary':                 ['secretary'],
  'Vice Chairman':             ['vice_chairman'],
  'Chairman':                  ['chairman'],
  'Super Admin':               ['chairman'],
  'Loan Committee Head':       ['loan_committee_head'],
  'Director Head':             ['director_head'],
  'Re-committee Head':         ['re_committee_head'],
  'Supervisor Committee Head': ['supervisor_committee_head'],
  'Employer Head':             ['employer_head'],
  'Supervisor':                ['employer_head'],
  'HR Director':               ['hr_director'],
  'HR':                        ['hr_director'],
  'Director':                  ['hr_director'],
};

const ALLOWED_ROLES = Object.keys(ROLE_STAGE_MAP);

function getUserActionStages(role: string): ApprovalStage[] {
  return ROLE_STAGE_MAP[role] || [];
}

function getAllowedTypesForRole(role: string): ApprovalType[] {
  const isChairman = role === 'Chairman' || role === 'Super Admin';
  if (isChairman) return ['member', 'withdrawal', 'loan', 'voucher', 'transaction', 'leave', 'manual_attendance'];
  const types: ApprovalType[] = [];
  if (['Secretary', 'Vice Chairman'].includes(role)) types.push('member', 'withdrawal', 'voucher', 'transaction');
  if (['Loan Committee Head', 'Director Head', 'Secretary'].includes(role)) types.push('loan');
  if (['Re-committee Head', 'Supervisor Committee Head', 'Secretary'].includes(role)) types.push('voucher');
  if (['Employer Head', 'Supervisor', 'HR Director', 'HR', 'Director'].includes(role)) {
    types.push('leave', 'manual_attendance');
  }
  return [...new Set(types)];
}

function buildEmptyStats() {
  return {
    myActionCount: 0, pendingMembers: 0, pendingTransactions: 0,
    pendingLoans: 0, pendingLeaves: 0, pendingAttendance: 0,
    totalPending: 0, completedCount: 0, rejectedCount: 0,
  };
}

async function autoSyncPendingRecords() {
  try {
    // 1. Pending Members
    const pendingMembers = await Member.find({ status: 'pending' }).lean();
    for (const m of pendingMembers) {
      const existing = await Approval.findOne({ entityId: m._id });
      if (!existing) {
        const count = await Approval.countDocuments();
        const approvalNo = `APP-${new Date().getFullYear()}-${(count + 1001).toString().padStart(4, '0')}`;
        await Approval.create({
          approvalNo, type: 'member',
          title: `New Member Registration: ${m.name}`,
          description: `Category: ${m.category} | Branch: ${m.branch}`,
          entityId: m._id, entityModel: 'Member',
          referenceNo: m.accountNo, memberId: m._id,
          memberName: m.name, memberAccountNo: m.accountNo,
          branch: m.branch || 'Main Branch',
          status: 'pending', currentStage: 'secretary', steps: [],
          submittedBy: 'Registration Desk', submittedAt: m.createdAt || new Date(),
          metadata: { mobile: m.mobile, nid: m.nid, fatherName: m.fatherName, motherName: m.motherName, category: m.category, address: m.address },
        });
      }
    }

    // 2. Pending Withdrawals
    const pendingWithdrawals = await WithdrawalRequest.find({ status: 'Pending' }).lean();
    for (const w of pendingWithdrawals) {
      const existing = await Approval.findOne({ entityId: w._id });
      if (!existing) {
        const count = await Approval.countDocuments();
        const approvalNo = `APP-${new Date().getFullYear()}-${(count + 1001).toString().padStart(4, '0')}`;
        await Approval.create({
          approvalNo, type: 'withdrawal',
          title: `Savings Withdrawal: ৳ ${w.amount.toLocaleString()} (${w.memberName})`,
          description: `Account: ${w.accountNo} (${w.schemeType}) | Reason: ${w.reason}`,
          entityId: w._id, entityModel: 'WithdrawalRequest',
          referenceNo: w.requestNo, memberId: w.memberId,
          memberName: w.memberName, memberAccountNo: w.memberAccountNo,
          amount: w.amount, branch: w.branch || 'Main Branch',
          status: 'pending', currentStage: 'secretary', steps: [],
          submittedBy: w.appliedBy || 'Teller Staff', submittedAt: w.createdAt || new Date(),
          metadata: { schemeType: w.schemeType, availableBalance: w.availableBalance, reason: w.reason },
        });
      }
    }

    // 3. Pending Loans → starts at loan_committee_head
    const pendingLoans = await LoanAccount.find({ status: 'pending_approval' }).lean();
    for (const l of pendingLoans) {
      const existing = await Approval.findOne({ entityId: l._id });
      if (!existing) {
        const count = await Approval.countDocuments();
        const approvalNo = `APP-${new Date().getFullYear()}-${(count + 1001).toString().padStart(4, '0')}`;
        await Approval.create({
          approvalNo, type: 'loan',
          title: `Loan Application: ৳ ${l.principalAmount.toLocaleString()} (${l.memberName})`,
          description: `Product: ${l.productName} | ${l.installments} ${l.installmentType} installments | Purpose: ${l.purpose || 'General Loan'}`,
          entityId: l._id, entityModel: 'LoanAccount',
          referenceNo: l.loanNo, memberId: l.memberId,
          memberName: l.memberName, amount: l.principalAmount,
          branch: l.branch || 'Main Branch',
          status: 'pending', currentStage: 'loan_committee_head', steps: [],
          submittedBy: 'Loan Officer', submittedAt: l.createdAt || new Date(),
          metadata: { productName: l.productName, principalAmount: l.principalAmount, totalAmount: l.totalAmount, installments: l.installments, installmentAmount: l.installmentAmount, interestRate: l.interestRate },
        });
      }
    }

    // 4. Pending Leaves → starts at employer_head
    const pendingLeaves = await Leave.find({ status: 'pending' }).lean();
    for (const lv of pendingLeaves) {
      const existing = await Approval.findOne({ entityId: lv._id });
      if (!existing) {
        const count = await Approval.countDocuments();
        const approvalNo = `APP-${new Date().getFullYear()}-${(count + 1001).toString().padStart(4, '0')}`;
        await Approval.create({
          approvalNo, type: 'leave',
          title: `Leave Request: ${lv.empName} (${lv.leaveType})`,
          description: `${lv.totalDays} days | ${new Date(lv.fromDate).toLocaleDateString()} – ${new Date(lv.toDate).toLocaleDateString()} | Reason: ${lv.reason}`,
          entityId: lv._id, entityModel: 'Leave',
          referenceNo: lv.empCode,
          empId: lv.empId, empName: lv.empName, empCode: lv.empCode,
          branch: lv.branch || 'Main Branch',
          status: 'pending', currentStage: 'employer_head', steps: [],
          submittedBy: lv.empName, submittedAt: lv.createdAt || new Date(),
          metadata: { leaveType: lv.leaveType, fromDate: lv.fromDate, toDate: lv.toDate, totalDays: lv.totalDays, reason: lv.reason },
        });
      }
    }
  } catch (err) {
    console.error('Auto-sync error in /api/approvals:', err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUserFromRequest(req);
    if (!sessionUser || !ALLOWED_ROLES.includes(sessionUser.role)) {
      return NextResponse.json({ error: 'Forbidden: You do not have access to the Approvals module.' }, { status: 403 });
    }

    await connectDB();
    await autoSyncPendingRecords();

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'my_queue';
    const type = searchParams.get('type') || '';
    const stage = searchParams.get('stage') || '';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const userActionStages = getUserActionStages(sessionUser.role);
    const role = sessionUser.role;
    const isChairman = role === 'Chairman' || role === 'Super Admin';
    const isHRRole = ['Employer Head', 'Supervisor', 'HR Director', 'HR', 'Director'].includes(role);
    const isLoanRole = ['Loan Committee Head', 'Director Head'].includes(role);
    const isVoucherRole = ['Re-committee Head', 'Supervisor Committee Head'].includes(role);
    const isSecretaryRole = role === 'Secretary';
    const isViceChairmanRole = role === 'Vice Chairman';

    const query: Record<string, any> = {};

    if (tab === 'my_queue') {
      query.status = 'pending';
      if (userActionStages.length > 0) query.currentStage = { $in: userActionStages };
    } else if (tab === 'members') {
      query.type = 'member';
      if (!isSecretaryRole && !isViceChairmanRole && !isChairman) {
        return NextResponse.json({ approvals: [], stats: buildEmptyStats() });
      }
    } else if (tab === 'transactions') {
      query.type = { $in: ['withdrawal', 'voucher', 'transaction'] };
      if (!isSecretaryRole && !isViceChairmanRole && !isChairman && !isLoanRole && !isVoucherRole) {
        return NextResponse.json({ approvals: [], stats: buildEmptyStats() });
      }
    } else if (tab === 'loans') {
      query.type = 'loan';
      if (!isLoanRole && !isSecretaryRole && !isChairman) {
        return NextResponse.json({ approvals: [], stats: buildEmptyStats() });
      }
    } else if (tab === 'leave') {
      query.type = 'leave';
      if (!isHRRole && !isChairman) return NextResponse.json({ approvals: [], stats: buildEmptyStats() });
    } else if (tab === 'manual_attendance') {
      query.type = 'manual_attendance';
      if (!isHRRole && !isChairman) return NextResponse.json({ approvals: [], stats: buildEmptyStats() });
    } else if (tab === 'all') {
      const allowedTypes = getAllowedTypesForRole(role);
      if (allowedTypes.length > 0) query.type = { $in: allowedTypes };
    } else if (tab === 'history') {
      query.status = { $in: ['approved', 'rejected'] };
      const allowedTypes = getAllowedTypesForRole(role);
      if (allowedTypes.length > 0) query.type = { $in: allowedTypes };
    }

    if (type) query.type = type;
    if (stage) query.currentStage = stage;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { approvalNo: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { referenceNo: { $regex: search, $options: 'i' } },
        { memberName: { $regex: search, $options: 'i' } },
        { memberAccountNo: { $regex: search, $options: 'i' } },
        { empName: { $regex: search, $options: 'i' } },
        { empCode: { $regex: search, $options: 'i' } },
      ];
    }

    const approvals = await Approval.find(query).sort({ createdAt: -1 }).lean();
    const allowedTypes = getAllowedTypesForRole(role);

    const [
      myActionCount, pendingMembers, pendingTransactions,
      pendingLoans, pendingLeaves, pendingAttendance,
      totalPending, completedCount, rejectedCount,
    ] = await Promise.all([
      userActionStages.length > 0
        ? Approval.countDocuments({ status: 'pending', currentStage: { $in: userActionStages } })
        : Promise.resolve(0),
      (isSecretaryRole || isViceChairmanRole || isChairman)
        ? Approval.countDocuments({ type: 'member', status: 'pending' }) : Promise.resolve(0),
      (isSecretaryRole || isViceChairmanRole || isChairman || isLoanRole || isVoucherRole)
        ? Approval.countDocuments({ type: { $in: ['withdrawal', 'voucher', 'transaction'] }, status: 'pending' }) : Promise.resolve(0),
      (isLoanRole || isSecretaryRole || isChairman)
        ? Approval.countDocuments({ type: 'loan', status: 'pending' }) : Promise.resolve(0),
      (isHRRole || isChairman)
        ? Approval.countDocuments({ type: 'leave', status: 'pending' }) : Promise.resolve(0),
      (isHRRole || isChairman)
        ? Approval.countDocuments({ type: 'manual_attendance', status: 'pending' }) : Promise.resolve(0),
      allowedTypes.length > 0
        ? Approval.countDocuments({ type: { $in: allowedTypes }, status: 'pending' }) : Promise.resolve(0),
      allowedTypes.length > 0
        ? Approval.countDocuments({ type: { $in: allowedTypes }, status: 'approved' }) : Promise.resolve(0),
      allowedTypes.length > 0
        ? Approval.countDocuments({ type: { $in: allowedTypes }, status: 'rejected' }) : Promise.resolve(0),
    ]);

    return NextResponse.json({
      approvals,
      stats: {
        myActionCount, pendingMembers, pendingTransactions,
        pendingLoans, pendingLeaves, pendingAttendance,
        totalPending, completedCount, rejectedCount,
      },
      userRole: sessionUser.role,
      userActionStages,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch approvals';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUserFromRequest(req);
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { title, description, type = 'transaction', amount = 0, branch, metadata = {} } = body;

    if (!title) return NextResponse.json({ error: 'Title is required for approval request' }, { status: 400 });

    const count = await Approval.countDocuments();
    const approvalNo = `APP-${new Date().getFullYear()}-${(count + 1001).toString().padStart(4, '0')}`;
    const referenceNo = `TXN-${(count + 5001).toString().padStart(4, '0')}`;

    let startStage: ApprovalStage = 'secretary';
    if (type === 'loan') startStage = 'loan_committee_head';
    else if (type === 'voucher') startStage = 're_committee_head';
    else if (type === 'leave' || type === 'manual_attendance') startStage = 'employer_head';

    let entityId: any = null;

    if (type === 'voucher' || type === 'transaction' || type === 'withdrawal') {
      const vch = await Voucher.create({
        voucherNo: referenceNo, type: 'payment',
        entries: [
          { accountCode: '4001', accountName: title, debit: Number(amount), credit: 0 },
          { accountCode: '1010', accountName: 'Cash in Hand', debit: 0, credit: Number(amount) },
        ],
        totalDebit: Number(amount), totalCredit: Number(amount),
        narration: description || title, preparedBy: sessionUser.name,
        branch: branch || sessionUser.branch || 'Main Branch', status: 'draft',
      });
      entityId = vch._id;
    }

    const approval = await Approval.create({
      approvalNo, type, title, description,
      entityId: entityId || new (require('mongoose').Types.ObjectId)(),
      entityModel: 'Voucher',
      referenceNo, amount: Number(amount),
      branch: branch || sessionUser.branch || 'Main Branch',
      status: 'pending', currentStage: startStage, steps: [],
      submittedBy: sessionUser.name, submittedAt: new Date(), metadata,
    });

    return NextResponse.json(approval, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to submit approval request';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
