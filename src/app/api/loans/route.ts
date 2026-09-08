import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LoanAccount from '@/models/LoanAccount';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const branch = searchParams.get('branch') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { loanNo: { $regex: search, $options: 'i' } },
        { memberName: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (branch) query.branch = branch;

    const total = await LoanAccount.countDocuments(query);
    const loans = await LoanAccount.find(query)
      .sort({ applicationDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const outstanding = await LoanAccount.aggregate([
      { $match: { status: { $in: ['active', 'disbursed'] } } },
      { $group: { _id: null, total: { $sum: '$dueAmount' } } },
    ]);

    return NextResponse.json({
      loans,
      totalOutstanding: outstanding[0]?.total ?? 0,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const count = await LoanAccount.countDocuments();
    const year = new Date().getFullYear();
    const loanNo = `LN-${year}-${(count + 1).toString().padStart(3, '0')}`;

    // Calculate interest and totals
    const principal = parseFloat(body.principalAmount);
    const rate = parseFloat(body.interestRate) / 100;
    const months = parseInt(body.installments);
    const installmentType: string = body.installmentType || 'Monthly';
    const interestAmount = principal * rate * (months / 12);
    const totalAmount = principal + interestAmount;
    const installmentAmount = Math.ceil(totalAmount / months);

    // Generate installment schedule
    const schedule = [];
    const startDate = new Date();
    const principalPerInstallment = Math.floor(principal / months);
    const interestPerInstallment = Math.ceil(interestAmount / months);

    for (let i = 1; i <= months; i++) {
      const dueDate = new Date(startDate);
      if (installmentType === 'Monthly') {
        dueDate.setMonth(dueDate.getMonth() + i);
      } else if (installmentType === 'Weekly') {
        dueDate.setDate(dueDate.getDate() + i * 7);
      } else {
        dueDate.setDate(dueDate.getDate() + i);
      }
      schedule.push({
        dueDate,
        principal: principalPerInstallment,
        interest: interestPerInstallment,
        total: installmentAmount,
        paidAmount: 0,
        status: 'pending',
      });
    }

    const loan = await LoanAccount.create({
      ...body,
      loanNo,
      interestAmount,
      totalAmount,
      dueAmount: totalAmount,
      installmentAmount,
      status: 'pending_approval',
      schedule,
    });

    return NextResponse.json(loan, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create loan';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
