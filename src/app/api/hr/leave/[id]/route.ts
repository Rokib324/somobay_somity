import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Leave from '@/models/Leave';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const leave = await Leave.findByIdAndUpdate(
      id,
      { status: body.status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!leave) {
      return NextResponse.json({ error: 'Leave application not found' }, { status: 404 });
    }

    return NextResponse.json(leave);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update leave';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const leave = await Leave.findById(id).lean();
    if (!leave) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(leave);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch leave' }, { status: 500 });
  }
}
