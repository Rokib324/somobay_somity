import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SMS from '@/models/SMS';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const total = await SMS.countDocuments(query);
    const messages = await SMS.find(query)
      .sort({ sentAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const summary = await SMS.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return NextResponse.json({ messages, summary, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch SMS history' }, { status: 500 });
  }
}
