import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import { nextSequentialCode, isDuplicateKeyError } from '@/lib/sequence';

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

    // Friendly check for an already-registered NID
    if (body.nid && (await Member.exists({ nid: body.nid }))) {
      return NextResponse.json(
        { error: `A member with NID "${body.nid}" is already registered.` },
        { status: 409 }
      );
    }

    // Auto-generate account number from the highest existing one (not the count,
    // which collides after deletions). Retry if two registrations race.
    let member;
    for (let attempt = 0; attempt < 5; attempt++) {
      const accountNo = await nextSequentialCode(Member, 'accountNo', 'AC-', 1001);
      try {
        // New members enter with status 'pending' awaiting executive approval
        member = await Member.create({
          ...body,
          accountNo,
          status: body.status === 'active' ? 'pending' : (body.status || 'pending'),
        });
        break;
      } catch (err) {
        if (isDuplicateKeyError(err, 'accountNo') && attempt < 4) continue;
        throw err;
      }
    }
    if (!member) throw new Error('Could not allocate a unique account number. Please try again.');

    // Create Approval record for Secretary review
    try {
      const approvalNo = await nextSequentialCode(Approval, 'approvalNo', `APP-${new Date().getFullYear()}-`, 1001);
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
    if (isDuplicateKeyError(error, 'nid')) {
      return NextResponse.json({ error: 'A member with this NID is already registered.' }, { status: 409 });
    }
    const msg = error instanceof Error ? error.message : 'Failed to create member';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
