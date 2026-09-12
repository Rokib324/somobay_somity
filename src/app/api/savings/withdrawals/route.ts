import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WithdrawalRequest from '@/models/WithdrawalRequest';
import DepositAccount from '@/models/DepositAccount';
import Member from '@/models/Member';
import Collection from '@/models/Collection';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { requestNo: { $regex: search, $options: 'i' } },
        { memberName: { $regex: search, $options: 'i' } },
        { accountNo: { $regex: search, $options: 'i' } },
        { memberAccountNo: { $regex: search, $options: 'i' } },
      ];
    }

    const requests = await WithdrawalRequest.find(query).sort({ createdAt: -1 }).lean();

    const stats = {
      pendingCount: await WithdrawalRequest.countDocuments({ status: 'Pending' }),
      approvedCount: await WithdrawalRequest.countDocuments({ status: 'Approved' }),
      rejectedCount: await WithdrawalRequest.countDocuments({ status: 'Rejected' }),
    };

    return NextResponse.json({ withdrawals: requests, stats });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 });
  }
}

// POST: Submit a new withdrawal application
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { accountId, amount, reason, appliedBy } = body;

    if (!accountId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid account and positive withdrawal amount required' }, { status: 400 });
    }

    const account = await DepositAccount.findById(accountId);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const member = await Member.findById(account.memberId);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const withdrawAmt = Number(amount);
    if (account.balance < withdrawAmt) {
      return NextResponse.json({
        error: `Insufficient account balance. Available: ৳ ${account.balance.toLocaleString()}`,
      }, { status: 400 });
    }

    const count = await WithdrawalRequest.countDocuments();
    const requestNo = `WR-${(count + 101).toString().padStart(4, '0')}`;

    const request = await WithdrawalRequest.create({
      requestNo,
      memberId: member._id,
      memberName: member.name,
      memberAccountNo: member.accountNo,
      accountId: account._id,
      accountNo: account.accountNo,
      schemeType: account.type,
      amount: withdrawAmt,
      availableBalance: account.balance,
      reason: reason || 'Savings encashment',
      appliedBy: appliedBy || 'Teller Staff',
      branch: member.branch || 'Main Branch',
      status: 'Pending',
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to submit withdrawal request';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// PUT: Approve or Reject withdrawal request
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { requestId, action, reviewerName, rejectionReason } = body;

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Request ID and action (Approve/Reject) required' }, { status: 400 });
    }

    const request = await WithdrawalRequest.findById(requestId);
    if (!request) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
    }

    if (request.status !== 'Pending') {
      return NextResponse.json({ error: `Request has already been ${request.status.toLowerCase()}` }, { status: 400 });
    }

    if (action === 'Reject') {
      request.status = 'Rejected';
      request.approvedBy = reviewerName || 'Operations In-Charge';
      request.rejectionReason = rejectionReason || 'Rejected by management';
      request.approvalDate = new Date();
      await request.save();
      return NextResponse.json({ success: true, message: 'Withdrawal rejected', request });
    }

    if (action === 'Approve') {
      const account = await DepositAccount.findById(request.accountId);
      if (!account) {
        return NextResponse.json({ error: 'Associated savings account not found' }, { status: 404 });
      }

      if (account.balance < request.amount) {
        return NextResponse.json({
          error: `Approval failed: Account balance has dropped to ৳ ${account.balance.toLocaleString()}, which is below requested ৳ ${request.amount.toLocaleString()}`,
        }, { status: 400 });
      }

      // 1. Deduct balance from DepositAccount
      account.balance -= request.amount;
      account.transactions = account.transactions || [];
      account.transactions.push({
        date: new Date(),
        type: 'withdrawal',
        amount: request.amount,
        balance: account.balance,
        reference: request.requestNo,
        notes: `Approved withdrawal: ${request.reason}`,
        collectedBy: reviewerName || 'Operations In-Charge',
      });
      await account.save();

      // 2. Adjust member totalDeposit
      const member = await Member.findById(request.memberId);
      if (member) {
        member.totalDeposit = Math.max(0, (member.totalDeposit || 0) - request.amount);
        await member.save();
      }

      // 3. Record in Collection log
      await Collection.create({
        date: new Date(),
        memberId: request.memberId,
        memberName: request.memberName,
        accountNo: request.accountNo,
        branch: request.branch,
        type: 'withdrawal',
        accountId: request.accountId,
        amount: request.amount,
        collectedBy: reviewerName || 'Cash Officer',
        reference: request.requestNo,
        notes: request.reason,
      });

      // 4. Update request status
      request.status = 'Approved';
      request.approvedBy = reviewerName || 'Operations In-Charge';
      request.approvalDate = new Date();
      await request.save();

      return NextResponse.json({ success: true, message: 'Withdrawal approved and disbursed', request });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update withdrawal request';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
