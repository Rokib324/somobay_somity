import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';

// GET /api/members?search=...&category=...&branch=...&status=...&page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const branch = searchParams.get('branch') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { accountNo: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { nid: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (branch) query.branch = branch;
    if (status) query.status = status;

    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      members,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

// POST /api/members — Register new member
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Auto-generate account number
    const count = await Member.countDocuments();
    const accountNo = `AC-${(count + 1001).toString().padStart(4, '0')}`;

    const member = await Member.create({ ...body, accountNo });
    return NextResponse.json(member, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create member';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
