import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getSessionUserFromRequest } from '@/lib/auth';
import Approval, { ApprovalStage } from '@/models/Approval';
import Member from '@/models/Member';
import WithdrawalRequest from '@/models/WithdrawalRequest';
import LoanAccount from '@/models/LoanAccount';
import Voucher from '@/models/Voucher';

const ALLOWED_ROLES = ['Secretary', 'Vice Chairman', 'Chairman', 'Super Admin'];

// Helper to auto-sync pre-existing pending records from Member, WithdrawalRequest, LoanAccount
async function autoSyncPendingRecords() {
  try {
    // 1. Check pending Members
    const pendingMembers = await Member.find({ status: 'pending' }).lean();
    for (const m of pendingMembers) {
      const existing = await Approval.findOne({ entityId: m._id });
      if (!existing) {
        const count = await Approval.countDocuments();
        const approvalNo = `APP-${new Date().getFullYear()}-${(count + 1001).toString().padStart(4, '0')}`;
        await Approval.create({
          approvalNo,
          type: 'member',
          title: `New Member Registration: ${m.name}`,
          description: `Category: ${m.category} | Branch: ${m.branch}`,
          entityId: m._id,
          entityModel: 'Member',
          referenceNo: m.accountNo,
          memberId: m._id,
          memberName: m.name,
          memberAccountNo: m.accountNo,
          branch: m.branch || 'Main Branch',
          status: 'pending',
          currentStage: 'secretary',
          steps: [],
          submittedBy: 'Registration Desk',
          submittedAt: m.createdAt || new Date(),
          metadata: {
            mobile: m.mobile,
            nid: m.nid,
            fatherName: m.fatherName,
            motherName: m.motherName,
            category: m.category,
            address: m.address,
          },
        });
      }
    }

    // 2. Check pending WithdrawalRequests
    const pendingWithdrawals = await WithdrawalRequest.find({ status: 'Pending' }).lean();
    for (const w of pendingWithdrawals) {
      const existing = await Approval.findOne({ entityId: w._id });
      if (!existing) {
        const count = await Approval.countDocuments();
        const approvalNo = `APP-${new Date().getFullYear()}-${(count + 1001).toString().padStart(4, '0')}`;
        await Approval.create({
          approvalNo,
          type: 'withdrawal',
          title: `Savings Withdrawal: ৳ ${w.amount.toLocaleString()} (${w.memberName})`,
          description: `Account: ${w.accountNo} (${w.schemeType}) | Reason: ${w.reason}`,
          entityId: w._id,
          entityModel: 'WithdrawalRequest',
          referenceNo: w.requestNo,
          memberId: w.memberId,
          memberName: w.memberName,
          memberAccountNo: w.memberAccountNo,
          amount: w.amount,
          branch: w.branch || 'Main Branch',
          status: 'pending',
          currentStage: 'secretary',
          steps: [],
          submittedBy: w.appliedBy || 'Teller Staff',
          submittedAt: w.createdAt || new Date(),
          metadata: {
            schemeType: w.schemeType,
            availableBalance: w.availableBalance,
            reason: w.reason,
          },
        });
      }
    }

    // 3. Check pending LoanAccounts
    const pendingLoans = await LoanAccount.find({ status: 'pending_approval' }).lean();
    for (const l of pendingLoans) {
      const existing = await Approval.findOne({ entityId: l._id });
      if (!existing) {
        const count = await Approval.countDocuments();
        const approvalNo = `APP-${new Date().getFullYear()}-${(count + 1001).toString().padStart(4, '0')}`;
        await Approval.create({
          approvalNo,
          type: 'loan',
          title: `Loan Application: ৳ ${l.principalAmount.toLocaleString()} (${l.memberName})`,
          description: `Product: ${l.productName} | ${l.installments} ${l.installmentType} installments | Purpose: ${l.purpose || 'General Loan'}`,
          entityId: l._id,
          entityModel: 'LoanAccount',
          referenceNo: l.loanNo,
          memberId: l.memberId,
          memberName: l.memberName,
          amount: l.principalAmount,
          branch: l.branch || 'Main Branch',
          status: 'pending',
          currentStage: 'secretary',
          steps: [],
          submittedBy: 'Loan Officer',
          submittedAt: l.createdAt || new Date(),
          metadata: {
            productName: l.productName,
            principalAmount: l.principalAmount,
            totalAmount: l.totalAmount,
            installments: l.installments,
            installmentAmount: l.installmentAmount,
            interestRate: l.interestRate,
          },
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
      return NextResponse.json(
        { error: 'Forbidden: Only Secretary, Vice Chairman, and Chairman can access Approvals.' },
        { status: 403 }
      );
    }

    await connectDB();
    await autoSyncPendingRecords();

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'my_queue';
    const type = searchParams.get('type') || '';
    const stage = searchParams.get('stage') || '';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    // Determine target stage for the user's "My Action Queue"
    let userActionStage: ApprovalStage | '' = '';
    if (sessionUser.role === 'Secretary') {
      userActionStage = 'secretary';
    } else if (sessionUser.role === 'Vice Chairman') {
      userActionStage = 'vice_chairman';
    } else if (sessionUser.role === 'Chairman' || sessionUser.role === 'Super Admin') {
      userActionStage = 'chairman';
    }

    const query: Record<string, any> = {};

    if (tab === 'my_queue') {
      query.status = 'pending';
      if (userActionStage) {
        query.currentStage = userActionStage;
      }
    } else if (tab === 'members') {
      query.type = 'member';
    } else if (tab === 'transactions') {
      query.type = { $ne: 'member' };
    } else if (tab === 'history') {
      query.status = { $in: ['approved', 'rejected'] };
    }

    // Direct filter overrides
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
      ];
    }

    const approvals = await Approval.find(query).sort({ createdAt: -1 }).lean();

    // Compute KPI Counts
    const [
      myActionCount,
      pendingMembers,
      pendingTransactions,
      totalPending,
      completedCount,
      rejectedCount,
    ] = await Promise.all([
      userActionStage
        ? Approval.countDocuments({ status: 'pending', currentStage: userActionStage as ApprovalStage })
        : 0,
      Approval.countDocuments({ type: 'member', status: 'pending' }),
      Approval.countDocuments({ type: { $ne: 'member' }, status: 'pending' }),
      Approval.countDocuments({ status: 'pending' }),
      Approval.countDocuments({ status: 'approved' }),
      Approval.countDocuments({ status: 'rejected' }),
    ]);

    return NextResponse.json({
      approvals,
      stats: {
        myActionCount,
        pendingMembers,
        pendingTransactions,
        totalPending,
        completedCount,
        rejectedCount,
      },
      userRole: sessionUser.role,
      userActionStage,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch approvals';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/approvals — Submit an ad-hoc transaction or voucher for approval
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUserFromRequest(req);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { title, description, type = 'transaction', amount = 0, branch, metadata = {} } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required for approval request' }, { status: 400 });
    }

    const count = await Approval.countDocuments();
    const approvalNo = `APP-${new Date().getFullYear()}-${(count + 1001).toString().padStart(4, '0')}`;
    const referenceNo = `TXN-${(count + 5001).toString().padStart(4, '0')}`;

    // Optionally create a Voucher if voucher type
    let entityId = null;
    let entityModel: 'Voucher' | 'Collection' = 'Voucher';

    if (type === 'voucher' || type === 'transaction') {
      const vch = await Voucher.create({
        voucherNo: referenceNo,
        type: 'payment',
        entries: [
          { accountCode: '4001', accountName: title, debit: Number(amount), credit: 0 },
          { accountCode: '1010', accountName: 'Cash in Hand', debit: 0, credit: Number(amount) },
        ],
        totalDebit: Number(amount),
        totalCredit: Number(amount),
        narration: description || title,
        preparedBy: sessionUser.name,
        branch: branch || sessionUser.branch || 'Main Branch',
        status: 'draft',
      });
      entityId = vch._id;
      entityModel = 'Voucher';
    }

    const approval = await Approval.create({
      approvalNo,
      type: type === 'voucher' ? 'voucher' : 'transaction',
      title,
      description,
      entityId: entityId || new Member()._id, // fallback placeholder if purely virtual
      entityModel,
      referenceNo,
      amount: Number(amount),
      branch: branch || sessionUser.branch || 'Main Branch',
      status: 'pending',
      currentStage: 'secretary', // Always begins at Secretary
      steps: [],
      submittedBy: sessionUser.name,
      submittedAt: new Date(),
      metadata,
    });

    return NextResponse.json(approval, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to submit approval request';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
