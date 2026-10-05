import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LoanProduct from '@/models/LoanProduct';
import { createWithSequentialCode } from '@/lib/sequence';

export async function GET() {
  try {
    await connectDB();
    const products = await LoanProduct.find().sort({ name: 1 }).lean();
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch loan products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const product = body.code
      ? await LoanProduct.create(body)
      : await createWithSequentialCode(
          { model: LoanProduct, field: 'code', prefix: 'LP', startAt: 1, pad: 1 },
          (code) => LoanProduct.create({ ...body, code })
        );
    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create loan product';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
