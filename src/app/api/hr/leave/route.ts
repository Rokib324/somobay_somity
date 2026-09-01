import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Leave from '@/models/Leave';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const branch = searchParams.get('branch') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (branch) query.branch = branch;

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ leaves, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch leaves' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const from = new Date(body.fromDate);
    const to = new Date(body.toDate);
    const totalDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const leave = await Leave.create({ ...body, totalDays, status: 'pending' });
    return NextResponse.json(leave, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to apply leave';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
