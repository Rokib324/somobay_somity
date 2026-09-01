import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const branch = searchParams.get('branch') || '';

    const d = new Date(date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const query: Record<string, unknown> = { date: { $gte: d, $lt: next } };
    if (branch) query.branch = branch;

    const attendance = await Attendance.find(query).sort({ empCode: 1 }).lean();

    const summary = await Attendance.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return NextResponse.json({ attendance, summary, date });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Upsert attendance record
    const record = await Attendance.findOneAndUpdate(
      { empId: body.empId, date: { $gte: new Date(body.date), $lt: new Date(new Date(body.date).setDate(new Date(body.date).getDate() + 1)) } },
      body,
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to mark attendance';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
