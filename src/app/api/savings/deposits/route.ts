import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DepositAccount from '@/models/DepositAccount';
import Member from '@/models/Member';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { accountNo: { $regex: search, $options: 'i' } },
        { memberName: { $regex: search, $options: 'i' } },
      ];
    }
    if (type) query.type = type;
    if (status) query.status = status;

    const total = await DepositAccount.countDocuments(query);
    const deposits = await DepositAccount.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalBalance = await DepositAccount.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$balance' } } },
    ]);

    return NextResponse.json({
      deposits,
      totalBalance: totalBalance[0]?.total ?? 0,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch deposits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.memberId || !body.type) {
      return NextResponse.json({ error: 'Member and savings scheme type are required' }, { status: 400 });
    }

    // Share Account Prerequisite Check:
    // If not opening a Share Capital account, verify the member already owns an active Share Capital account
    if (body.type !== 'Share Capital') {
      const hasShareAccount = await DepositAccount.findOne({
        memberId: body.memberId,
        type: { $regex: /share capital/i },
        status: 'active',
      });

      if (!hasShareAccount) {
        return NextResponse.json(
          {
            error:
              'Share Account Required: Cooperative rules mandate that every member must possess an active Share Capital account before opening any other savings product. Please create a Share Capital account for this member first.',
            requiresShareAccount: true,
          },
          { status: 400 }
        );
      }
    }

    const count = await DepositAccount.countDocuments();
    const accountNo = `DEP-${(count + 101).toString().padStart(4, '0')}`;
    const initialAmount = Number(body.amount) || 0;

    // Update member totalDeposit
    if (body.memberId && initialAmount > 0) {
      await Member.findByIdAndUpdate(body.memberId, {
        $inc: { totalDeposit: initialAmount },
      });
    }

    const initialTransactions = initialAmount > 0 ? [{
      date: new Date(),
      type: 'deposit' as const,
      amount: initialAmount,
      balance: initialAmount,
      reference: 'Opening Deposit',
      notes: 'Initial opening installment credit',
    }] : [];

    const deposit = await DepositAccount.create({
      ...body,
      accountNo,
      balance: initialAmount,
      transactions: initialTransactions,
    });

    return NextResponse.json(deposit, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create deposit account';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
