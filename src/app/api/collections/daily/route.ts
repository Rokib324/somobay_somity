import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Collection from '@/models/Collection';
import LoanAccount from '@/models/LoanAccount';
import Member from '@/models/Member';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const branch = searchParams.get('branch') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');

    const query: Record<string, unknown> = {};
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

    const summary = await Collection.aggregate([
      { $match: query },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    return NextResponse.json({ collections, summary, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch daily collections' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const collection = await Collection.create(body);

    // If loan installment, update loan paidAmount
    if (body.type === 'loan_installment' && body.accountId) {
      const loan = await LoanAccount.findById(body.accountId);
      if (loan) {
        loan.paidAmount += body.amount;
        loan.dueAmount = Math.max(0, loan.dueAmount - body.amount);
        if (loan.dueAmount === 0) loan.status = 'closed';
        await loan.save();
        await Member.findByIdAndUpdate(body.memberId, { $inc: { totalLoan: -body.amount } });
      }
    }

    return NextResponse.json(collection, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to save collection';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
