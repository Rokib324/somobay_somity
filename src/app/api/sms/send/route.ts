import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SMS from '@/models/SMS';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const messages = Array.isArray(body.messages) ? body.messages : [body];

    // Simulate sending: 95% Delivered, 5% Failed
    const records = messages.map((msg: { recipient: string; phone: string; message: string; type?: string }) => ({
      ...msg,
      type: msg.type || 'Notification',
      status: Math.random() > 0.05 ? 'Delivered' : 'Failed',
      sentAt: new Date(),
    }));

    const saved = await SMS.insertMany(records);

    return NextResponse.json({
      success: true,
      sent: saved.length,
      delivered: saved.filter(s => s.status === 'Delivered').length,
      failed: saved.filter(s => s.status === 'Failed').length,
      records: saved,
    }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to send SMS';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const summary = await SMS.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch SMS stats' }, { status: 500 });
  }
}
