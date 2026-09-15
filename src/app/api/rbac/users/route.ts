/**
 * GET /api/rbac/users
 *
 * Lists all system users with their current roles for the Chairman's Role Assignment panel.
 * CHAIRMAN ONLY — throws 403 for non-chairman callers.
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireChairman } from '@/lib/auth';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  let chairman;
  try {
    chairman = await requireChairman(req);
  } catch (forbidden) {
    return forbidden as Response;
  }

  try {
    await connectDB();

    const users = await User.find({})
      .select('name email employeeId role branch status lastLogin createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      requestedBy: { id: chairman.id, name: chairman.name, role: chairman.role },
      users,
    });
  } catch (err) {
    console.error('[GET /api/rbac/users] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch users list.' },
      { status: 500 }
    );
  }
}
