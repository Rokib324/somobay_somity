import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MemberCategory from '@/models/MemberCategory';
import Member from '@/models/Member';

const DEFAULT_CATEGORIES = [
  { name: 'Staff Member', code: 'CAT-STAFF', fee: 500, minDeposit: 500, maxLoanLimit: 1000000, description: 'Permanent and contract society employees.' },
  { name: 'Farmer Member', code: 'CAT-FARMER', fee: 300, minDeposit: 100, maxLoanLimit: 400000, description: 'Agricultural producers and allied agro workers.' },
  { name: 'Business Member', code: 'CAT-BIZ', fee: 1000, minDeposit: 500, maxLoanLimit: 2500000, description: 'Retailers, wholesalers, and micro-entrepreneurs.' },
  { name: 'Student Member', code: 'CAT-STUDENT', fee: 200, minDeposit: 50, maxLoanLimit: 100000, description: 'High school and university students with youth accounts.' },
  { name: 'Senior Citizen Member', code: 'CAT-SENIOR', fee: 300, minDeposit: 200, maxLoanLimit: 300000, description: 'Retirees and senior citizens aged 60 and above.' },
  { name: 'Cooperative Member', code: 'CAT-COOP', fee: 500, minDeposit: 200, maxLoanLimit: 600000, description: 'General cooperative community members.' },
  { name: 'Young Entrepreneur', code: 'CAT-YOUNG', fee: 750, minDeposit: 300, maxLoanLimit: 1500000, description: 'Startups and young business innovators.' },
  { name: 'Association Member', code: 'CAT-ASSOC', fee: 1500, minDeposit: 1000, maxLoanLimit: 3000000, description: 'Registered business, trade, or welfare associations.' },
  { name: 'Founder Member', code: 'CAT-FOUNDER', fee: 5000, minDeposit: 2000, maxLoanLimit: 5000000, description: 'Original founding promoters and board patrons.' },
];

export async function GET() {
  try {
    await connectDB();
    const count = await MemberCategory.countDocuments();
    if (count === 0) {
      await MemberCategory.insertMany(DEFAULT_CATEGORIES);
    }

    const categories = await MemberCategory.find().sort({ createdAt: 1 }).lean();

    // Dynamically calculate active member counts
    const categoryCounts = await Member.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = {};
    categoryCounts.forEach(c => {
      if (c._id) countMap[c._id] = c.count;
    });

    const enriched = categories.map(cat => ({
      ...cat,
      activeMembers: countMap[cat.name] || 0,
    }));

    return NextResponse.json({ categories: enriched });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const code = body.code || `CAT-${body.name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const category = await MemberCategory.create({ ...body, code });
    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create category';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
