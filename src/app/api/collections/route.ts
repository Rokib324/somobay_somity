import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Collection from '@/models/Collection';
import DepositAccount from '@/models/DepositAccount';
import LoanAccount from '@/models/LoanAccount';
import Member from '@/models/Member';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';

    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { memberName: { $regex: search, $options: 'i' } },
        { accountNo: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
      ];
    }

    const collections = await Collection.find(query).sort({ date: -1 }).limit(100).lean();

    // Compute totals
    const depositTotal = await Collection.aggregate([
      { $match: { type: 'savings' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const withdrawalTotal = await Collection.aggregate([
      { $match: { type: 'withdrawal' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return NextResponse.json({
      collections,
      totals: {
        totalDeposits: depositTotal[0]?.total || 0,
        totalWithdrawals: withdrawalTotal[0]?.total || 0,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { type, accountId, amount, notes, collectedBy } = body;

    const collAmount = Number(amount);
    if (!type || !accountId || isNaN(collAmount) || collAmount <= 0) {
      return NextResponse.json({ error: 'Valid collection type, account, and positive amount required' }, { status: 400 });
    }

    // 1. Savings Deposit Collection
    if (type === 'savings') {
      const account = await DepositAccount.findById(accountId);
      if (!account) return NextResponse.json({ error: 'Deposit account not found' }, { status: 404 });

      const member = await Member.findById(account.memberId);
      if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

      // Update account balance
      account.balance += collAmount;
      account.transactions = account.transactions || [];
      account.transactions.push({
        date: new Date(),
        type: 'deposit',
        amount: collAmount,
        balance: account.balance,
        collectedBy: collectedBy || 'Field Officer',
        notes: notes || 'Centralized Counter Deposit',
      });
      await account.save();

      // Update member total
      member.totalDeposit = (member.totalDeposit || 0) + collAmount;
      await member.save();

      const record = await Collection.create({
        date: new Date(),
        memberId: member._id,
        memberName: member.name,
        accountNo: account.accountNo,
        branch: member.branch || 'Main Branch',
        type: 'savings',
        accountId: account._id,
        amount: collAmount,
        collectedBy: collectedBy || 'Field Officer',
        notes: notes || 'Deposit Collection',
      });

      return NextResponse.json(record, { status: 201 });
    }

    // 2. Savings Withdrawal Collection
    if (type === 'withdrawal') {
      const account = await DepositAccount.findById(accountId);
      if (!account) return NextResponse.json({ error: 'Deposit account not found' }, { status: 404 });

      if (account.balance < collAmount) {
        return NextResponse.json({
          error: `Insufficient account balance. Available: ৳ ${account.balance.toLocaleString()}`,
        }, { status: 400 });
      }

      const member = await Member.findById(account.memberId);
      if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

      // Update account balance
      account.balance -= collAmount;
      account.transactions = account.transactions || [];
      account.transactions.push({
        date: new Date(),
        type: 'withdrawal',
        amount: -collAmount,
        balance: account.balance,
        collectedBy: collectedBy || 'Cash Officer',
        notes: notes || 'Centralized Counter Withdrawal',
      });
      await account.save();

      // Update member total
      member.totalDeposit = Math.max(0, (member.totalDeposit || 0) - collAmount);
      await member.save();

      const record = await Collection.create({
        date: new Date(),
        memberId: member._id,
        memberName: member.name,
        accountNo: account.accountNo,
        branch: member.branch || 'Main Branch',
        type: 'withdrawal',
        accountId: account._id,
        amount: collAmount,
        collectedBy: collectedBy || 'Cash Officer',
        notes: notes || 'Withdrawal Collection',
      });

      return NextResponse.json(record, { status: 201 });
    }

    // 3. Loan Installment Collection
    if (type === 'loan_installment') {
      const loan = await LoanAccount.findById(accountId);
      if (!loan) return NextResponse.json({ error: 'Loan account not found' }, { status: 404 });

      const member = await Member.findById(loan.memberId);
      if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

      loan.paidAmount = (loan.paidAmount || 0) + collAmount;
      loan.dueAmount = Math.max(0, (loan.dueAmount || 0) - collAmount);
      if (loan.dueAmount <= 0) {
        loan.status = 'closed';
      }
      await loan.save();

      member.totalLoan = Math.max(0, (member.totalLoan || 0) - collAmount);
      await member.save();

      const record = await Collection.create({
        date: new Date(),
        memberId: member._id,
        memberName: member.name,
        accountNo: loan.loanNo,
        branch: member.branch || 'Main Branch',
        type: 'loan_installment',
        accountId: loan._id,
        amount: collAmount,
        collectedBy: collectedBy || 'Field Officer',
        notes: notes || 'Loan Installment Collection',
      });

      return NextResponse.json(record, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid collection type' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to record collection';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
