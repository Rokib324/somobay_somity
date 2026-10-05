import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Branch from '@/models/Branch';
import { createWithSequentialCode } from '@/lib/sequence';

export async function GET() {
  try {
    await connectDB();
    const branches = await Branch.find().sort({ code: 1 }).lean();
    return NextResponse.json({ branches });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const branch = body.code
      ? await Branch.create(body)
      : await createWithSequentialCode(
          { model: Branch, field: 'code', prefix: 'BR', startAt: 1, pad: 2 },
          (code) => Branch.create({ ...body, code })
        );
    return NextResponse.json(branch, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create branch';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
