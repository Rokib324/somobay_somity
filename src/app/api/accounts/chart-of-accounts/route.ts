import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AccountHead from '@/models/AccountHead';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const group = searchParams.get('group') || '';
    const status = searchParams.get('status') || '';

    const query: Record<string, unknown> = {};
    if (group) query.group = group;
    if (status) query.status = status;

    const accounts = await AccountHead.find(query).sort({ code: 1 }).lean();

    // Build summary by group
    const summary = await AccountHead.aggregate([
      { $match: { type: 'detail', status: 'active' } },
      { $group: { _id: '$group', total: { $sum: '$balance' } } },
    ]);

    return NextResponse.json({ accounts, summary });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch chart of accounts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const account = await AccountHead.create(body);
    return NextResponse.json(account, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create account head';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
