import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AccountHead from '@/models/AccountHead';

// Trial Balance, Profit & Loss, Balance Sheet
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get('type') || 'trial-balance';

    const accounts = await AccountHead.find({ status: 'active', type: 'detail' })
      .sort({ code: 1 })
      .lean();

    if (reportType === 'trial-balance') {
      const debitAccounts = accounts.filter(a =>
        ['Asset', 'Expense'].includes(a.group)
      );
      const creditAccounts = accounts.filter(a =>
        ['Liability', 'Equity', 'Income'].includes(a.group)
      );
      const totalDebit = debitAccounts.reduce((s, a) => s + a.balance, 0);
      const totalCredit = creditAccounts.reduce((s, a) => s + a.balance, 0);

      return NextResponse.json({
        type: 'trial-balance',
        debitAccounts,
        creditAccounts,
        totalDebit,
        totalCredit,
        balanced: Math.abs(totalDebit - totalCredit) < 0.01,
      });
    }

    if (reportType === 'profit-loss') {
      const incomeAccounts = accounts.filter(a => a.group === 'Income');
      const expenseAccounts = accounts.filter(a => a.group === 'Expense');
      const totalIncome = incomeAccounts.reduce((s, a) => s + a.balance, 0);
      const totalExpense = expenseAccounts.reduce((s, a) => s + a.balance, 0);

      return NextResponse.json({
        type: 'profit-loss',
        incomeAccounts,
        expenseAccounts,
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
      });
    }

    if (reportType === 'balance-sheet') {
      const assetAccounts = accounts.filter(a => a.group === 'Asset');
      const liabilityAccounts = accounts.filter(a => a.group === 'Liability');
      const equityAccounts = accounts.filter(a => a.group === 'Equity');
      const totalAssets = assetAccounts.reduce((s, a) => s + a.balance, 0);
      const totalLiabilities = liabilityAccounts.reduce((s, a) => s + a.balance, 0);
      const totalEquity = equityAccounts.reduce((s, a) => s + a.balance, 0);

      return NextResponse.json({
        type: 'balance-sheet',
        assetAccounts,
        liabilityAccounts,
        equityAccounts,
        totalAssets,
        totalLiabilities,
        totalEquity,
        balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      });
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
