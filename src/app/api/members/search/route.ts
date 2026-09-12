import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import DepositAccount from '@/models/DepositAccount';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    if (!q.trim()) {
      return NextResponse.json({ members: [] });
    }

    const members = await Member.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { accountNo: { $regex: q, $options: 'i' } },
        { mobile: { $regex: q, $options: 'i' } },
        { nid: { $regex: q, $options: 'i' } },
      ],
      status: 'active',
    })
      .limit(10)
      .lean();

    const memberIds = members.map(m => m._id);
    const accounts = await DepositAccount.find({
      memberId: { $in: memberIds },
      status: 'active',
    }).lean();

    const accountsByMember: Record<string, typeof accounts> = {};
    accounts.forEach(acc => {
      const mid = acc.memberId.toString();
      if (!accountsByMember[mid]) accountsByMember[mid] = [];
      accountsByMember[mid].push(acc);
    });

    const enriched = members.map(m => ({
      ...m,
      accounts: accountsByMember[m._id.toString()] || [],
    }));

    return NextResponse.json({ members: enriched });
  } catch {
    return NextResponse.json({ error: 'Failed to search members' }, { status: 500 });
  }
}
