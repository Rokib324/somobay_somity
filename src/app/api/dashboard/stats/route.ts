import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import DepositAccount from '@/models/DepositAccount';
import LoanAccount from '@/models/LoanAccount';
import Collection from '@/models/Collection';
import Employee from '@/models/Employee';
import SMS from '@/models/SMS';

export async function GET() {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalMembers,
      activeMembers,
      pendingMembers,
      totalDeposits,
      totalLoans,
      activeLoans,
      overdueLoans,
      dailyCollectionAgg,
      totalEmployees,
      recentCollections,
      recentSMS,
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: 'active' }),
      Member.countDocuments({ status: 'pending' }),
      DepositAccount.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: '$balance' } } },
      ]),
      LoanAccount.aggregate([
        { $match: { status: { $in: ['active', 'disbursed'] } } },
        { $group: { _id: null, total: { $sum: '$dueAmount' } } },
      ]),
      LoanAccount.countDocuments({ status: { $in: ['active', 'disbursed'] } }),
      LoanAccount.countDocuments({ status: 'overdue' }),
      Collection.aggregate([
        { $match: { date: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Employee.countDocuments({ status: 'active' }),
      Collection.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select('memberName amount type date accountNo'),
      SMS.find()
        .sort({ sentAt: -1 })
        .limit(5)
        .select('recipient message status sentAt type'),
    ]);

    return NextResponse.json({
      members: {
        total: totalMembers,
        active: activeMembers,
        pending: pendingMembers,
      },
      savings: {
        totalBalance: totalDeposits[0]?.total ?? 0,
      },
      loans: {
        totalOutstanding: totalLoans[0]?.total ?? 0,
        activeCount: activeLoans,
        overdueCount: overdueLoans,
      },
      todayCollection: dailyCollectionAgg[0]?.total ?? 0,
      employees: { active: totalEmployees },
      recentCollections,
      recentSMS,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
