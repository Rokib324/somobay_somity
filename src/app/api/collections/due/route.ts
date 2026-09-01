import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LoanAccount from '@/models/LoanAccount';

// Returns all overdue loan installments
export async function GET() {
  try {
    await connectDB();
    const today = new Date();

    // Mark loans as overdue if they have unpaid installments past due date
    const dueLoans = await LoanAccount.find({
      status: { $in: ['active', 'disbursed'] },
      dueAmount: { $gt: 0 },
      disbursementDate: { $lt: new Date(today.setDate(today.getDate() - 30)) },
    })
      .sort({ applicationDate: 1 })
      .lean();

    return NextResponse.json({ dueLoans, count: dueLoans.length });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dues' }, { status: 500 });
  }
}
