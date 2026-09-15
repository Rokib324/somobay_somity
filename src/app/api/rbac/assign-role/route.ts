/**
 * POST /api/rbac/assign-role
 *
 * Assigns a new role to a specific user.
 * CHAIRMAN ONLY — returns explicit 403 Forbidden for every other role.
 *
 * Body: { userId: string; role: CooperativeRole | LegacyRole }
 *
 * Guards:
 * - Non-chairman requests → 403 with CHAIRMAN_ONLY code
 * - Cannot demote the last Chairman in the system
 * - Role must be a known valid role
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireChairman } from '@/lib/auth';
import User, { ALL_ROLES } from '@/models/User';

export async function POST(req: NextRequest) {
  // ── Authorization: Chairman Only ────────────────────────────────────────────
  let chairman;
  try {
    chairman = await requireChairman(req);
  } catch (forbidden) {
    return forbidden as Response;
  }

  try {
    await connectDB();

    const body = await req.json();
    const { userId, role } = body as { userId: string; role: string };

    // ── Input Validation ───────────────────────────────────────────────────────
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and role are required.' },
        { status: 400 }
      );
    }

    if (!ALL_ROLES.includes(role as typeof ALL_ROLES[number])) {
      return NextResponse.json(
        {
          error: `Invalid role: "${role}". Allowed roles are: ${ALL_ROLES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // ── Fetch Target User ──────────────────────────────────────────────────────
    const targetUser = await User.findById(userId).select('-password');
    if (!targetUser) {
      return NextResponse.json(
        { error: `User not found with ID: ${userId}` },
        { status: 404 }
      );
    }

    // ── Guard: Prevent last Chairman self-demotion ─────────────────────────────
    const isTargetCurrentChairman =
      targetUser.role === 'Chairman' || targetUser.role === 'Super Admin';
    const wouldDemoteChairman =
      isTargetCurrentChairman && role !== 'Chairman' && role !== 'Super Admin';

    if (wouldDemoteChairman) {
      // Count remaining chairmen
      const chairmanCount = await User.countDocuments({
        role: { $in: ['Chairman', 'Super Admin'] },
        status: 'Active',
      });

      if (chairmanCount <= 1) {
        return NextResponse.json(
          {
            error:
              'Cannot demote the last Chairman. Assign another user as Chairman first before changing this role.',
            code: 'LAST_CHAIRMAN_GUARD',
          },
          { status: 409 }
        );
      }
    }

    // ── Prevent self-demotion ──────────────────────────────────────────────────
    if (userId === chairman.id && role !== 'Chairman' && role !== 'Super Admin') {
      return NextResponse.json(
        {
          error:
            'You cannot change your own role to a non-Chairman role. Ask another Chairman to do this.',
          code: 'SELF_DEMOTION_DENIED',
        },
        { status: 409 }
      );
    }

    const previousRole = targetUser.role;

    // ── Apply Role Assignment ──────────────────────────────────────────────────
    targetUser.role = role as typeof ALL_ROLES[number];
    await targetUser.save();

    return NextResponse.json({
      success: true,
      message: `Role successfully updated for ${targetUser.name}.`,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        previousRole,
        newRole: targetUser.role,
        branch: targetUser.branch,
      },
      assignedBy: { id: chairman.id, name: chairman.name, role: chairman.role },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[POST /api/rbac/assign-role] Error:', err);
    return NextResponse.json(
      { error: 'Failed to assign role. Please try again.' },
      { status: 500 }
    );
  }
}
