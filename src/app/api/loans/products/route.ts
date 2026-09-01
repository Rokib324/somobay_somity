import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LoanProduct from '@/models/LoanProduct';

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
    const count = await LoanProduct.countDocuments();
    const code = body.code || `LP${count + 1}`;
    const product = await LoanProduct.create({ ...body, code });
    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create loan product';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
