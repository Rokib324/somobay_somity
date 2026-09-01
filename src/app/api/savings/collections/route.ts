import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Collection from '@/models/Collection';
import DepositAccount from '@/models/DepositAccount';
import Member from '@/models/Member';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const branch = searchParams.get('branch') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');

    const query: Record<string, unknown> = { type: 'savings' };
    if (branch) query.branch = branch;
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      query.date = { $gte: d, $lt: next };
    }

    const total = await Collection.countDocuments(query);
    const collections = await Collection.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalAgg = await Collection.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return NextResponse.json({
      collections,
      totalAmount: totalAgg[0]?.total ?? 0,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const collection = await Collection.create({ ...body, type: 'savings' });

    // Update deposit account balance
    if (body.accountId) {
      await DepositAccount.findByIdAndUpdate(body.accountId, {
        $inc: { balance: body.amount },
        $push: {
          transactions: {
            date: new Date(),
            type: 'deposit',
            amount: body.amount,
            balance: 0, // will be computed
            collectedBy: body.collectedBy,
          },
        },
      });
    }

    // Update member totalDeposit
    if (body.memberId) {
      await Member.findByIdAndUpdate(body.memberId, { $inc: { totalDeposit: body.amount } });
    }

    return NextResponse.json(collection, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to save collection';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
