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

import Approval from '@/models/Approval';

// POST /api/members — Register new member
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Auto-generate account number
    const count = await Member.countDocuments();
    const accountNo = `AC-${(count + 1001).toString().padStart(4, '0')}`;

    // New members enter with status 'pending' awaiting executive approval
    const member = await Member.create({
      ...body,
      accountNo,
      status: body.status === 'active' ? 'pending' : (body.status || 'pending'),
    });

    // Create Approval record for Secretary review
    try {
      const appCount = await Approval.countDocuments();
      const approvalNo = `APP-${new Date().getFullYear()}-${(appCount + 1001).toString().padStart(4, '0')}`;
      await Approval.create({
        approvalNo,
        type: 'member',
        title: `New Member Registration: ${member.name}`,
        description: `Category: ${member.category} | Branch: ${member.branch || 'Main Branch'}`,
        entityId: member._id,
        entityModel: 'Member',
        referenceNo: member.accountNo,
        memberId: member._id,
        memberName: member.name,
        memberAccountNo: member.accountNo,
        branch: member.branch || 'Main Branch',
        status: 'pending',
        currentStage: 'secretary',
        steps: [],
        submittedBy: body.appliedBy || 'Registration Desk',
        submittedAt: new Date(),
        metadata: {
          mobile: member.mobile,
          nid: member.nid,
          fatherName: member.fatherName,
          motherName: member.motherName,
          category: member.category,
          address: member.address,
        },
      });
    } catch (appErr) {
      console.error('Failed to create Approval record for new member:', appErr);
    }

    return NextResponse.json(member, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create member';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
