import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import DepositAccount from '@/models/DepositAccount';
import LoanAccount from '@/models/LoanAccount';

type Params = { params: Promise<{ id: string }> };

// GET /api/members/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const member = await Member.findById(id).lean();
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Fetch related accounts and accounts where this member is a guarantor
    const guarantorConditions: Record<string, unknown>[] = [
      { guarantorMemberId: id },
      { guarantorAccountNo: member.accountNo },
      { guarantorNid: member.nid },
      { guarantorName: member.name },
    ];

    const [deposits, loans, guaranteedLoans] = await Promise.all([
      DepositAccount.find({ memberId: id }).lean(),
      LoanAccount.find({ memberId: id }).lean(),
      LoanAccount.find({ $or: guarantorConditions }).lean(),
    ]);

    return NextResponse.json({ member, deposits, loans, guaranteedLoans });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 });
  }
}

// PUT /api/members/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const member = await Member.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    return NextResponse.json(member);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update member';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// DELETE /api/members/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    await Member.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
