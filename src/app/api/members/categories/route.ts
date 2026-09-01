import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';

// GET /api/members/categories — returns distinct categories
export async function GET() {
  try {
    await connectDB();
    const categories = await Member.distinct('category');
    // Return categories with member counts
    const categoryCounts = await Member.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return NextResponse.json({ categories, categoryCounts });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/members/categories — add a member category (via member update)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    // Categories are managed as a list, return updated list
    const categories = await Member.distinct('category');
    return NextResponse.json({ categories: [...categories, body.name] });
  } catch {
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}
