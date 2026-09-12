import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LoanAccount from '@/models/LoanAccount';
import Member from '@/models/Member';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const loan = await LoanAccount.findById(id).lean();
    if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    return NextResponse.json(loan);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch loan' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const loan = await LoanAccount.findById(id);
    if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });

    // Handle disbursement status change
    if (body.status === 'disbursed' && loan.status === 'approved') {
      body.disbursementDate = new Date();
      // Update member totalLoan
      await Member.findByIdAndUpdate(loan.memberId, {
        $inc: { totalLoan: loan.principalAmount },
      });
    }

    // Handle approval
    if (body.status === 'approved' && loan.status === 'pending_approval') {
      body.approvedBy = body.approvedBy || 'System';
    }

    // Handle loan closing / early settlement
    if (body.status === 'closed') {
      const priorDue = loan.dueAmount || 0;
      await Member.findByIdAndUpdate(loan.memberId, {
        $inc: { totalLoan: -priorDue },
      });
      body.dueAmount = 0;
      body.paidAmount = loan.totalAmount;
    }

    Object.assign(loan, body);
    await loan.save();

    return NextResponse.json(loan);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update loan';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
