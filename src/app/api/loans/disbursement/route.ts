import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LoanAccount, { ILoanAccount } from '@/models/LoanAccount';
import Member from '@/models/Member';

// GET pending approval + approved (ready for disburse)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') || 'approved') as ILoanAccount['status'];

    const loans = await LoanAccount.find({ status })
      .sort({ applicationDate: -1 })
      .lean();

    return NextResponse.json({ loans });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch disbursements' }, { status: 500 });
  }
}

// POST — disburse a loan
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { loanId, disbursedBy } = await req.json();

    const loan = await LoanAccount.findById(loanId);
    if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    if (!['approved', 'pending_approval'].includes(loan.status)) {
      return NextResponse.json({ error: 'Loan cannot be disbursed at current status' }, { status: 400 });
    }

    loan.status = 'active';
    loan.disbursementDate = new Date();
    loan.disbursedBy = disbursedBy || 'Admin';

    await loan.save();

    // Update member totalLoan
    await Member.findByIdAndUpdate(loan.memberId, {
      $inc: { totalLoan: loan.principalAmount },
    });

    return NextResponse.json({ success: true, loan });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to disburse loan';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
