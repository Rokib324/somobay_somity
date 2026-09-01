import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Collection from '@/models/Collection';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, unknown> = { type: 'advance' };
    if (branch) query.branch = branch;

    const total = await Collection.countDocuments(query);
    const advances = await Collection.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalAdvance = await Collection.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return NextResponse.json({
      advances,
      totalAmount: totalAdvance[0]?.total ?? 0,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch advance collections' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const advance = await Collection.create({ ...body, type: 'advance' });
    return NextResponse.json(advance, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to record advance';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
