import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DepositAccount from '@/models/DepositAccount';
import Member from '@/models/Member';
import Collection from '@/models/Collection';

// GET /api/savings/withdrawals?memberId=...&accountId=...
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId') || '';
    const memberId = searchParams.get('memberId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, unknown> = { type: 'withdrawal' };
    if (accountId) query.accountId = accountId;
    if (memberId) query.memberId = memberId;

    const total = await Collection.countDocuments(query);
    const withdrawals = await Collection.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ withdrawals, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 });
  }
}

// POST /api/savings/withdrawals
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.accountId || !body.amount || body.amount <= 0) {
      return NextResponse.json({ error: 'Account ID and positive amount are required' }, { status: 400 });
    }

    // Check account balance
    const account = await DepositAccount.findById(body.accountId);
    if (!account) {
      return NextResponse.json({ error: 'Savings account not found' }, { status: 404 });
    }

    if (account.balance < body.amount) {
      return NextResponse.json({
        error: `Insufficient balance. Available: ৳${account.balance.toLocaleString()}`,
      }, { status: 400 });
    }

    // Post withdrawal collection
    const withdrawal = await Collection.create({
      ...body,
      type: 'withdrawal',
      date: body.date ? new Date(body.date) : new Date(),
    });

    // Deduct from account balance
    account.balance -= body.amount;
    account.transactions = account.transactions || [];
    account.transactions.push({
      date: new Date(),
      type: 'withdrawal',
      amount: -body.amount,
      balance: account.balance,
      collectedBy: body.collectedBy || 'System',
    });
    await account.save();

    // Update member totalDeposit
    if (body.memberId) {
      await Member.findByIdAndUpdate(body.memberId, {
        $inc: { totalDeposit: -body.amount },
      });
    }

    return NextResponse.json(withdrawal, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to process withdrawal';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
