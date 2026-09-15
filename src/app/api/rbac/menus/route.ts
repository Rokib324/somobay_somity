/**
 * GET /api/rbac/menus
 *
 * Returns the authorized, nested menu tree for the currently authenticated user.
 * Every authenticated user can call this endpoint — it filters based on their role.
 * User-level menuPrivileges are merged on top of role defaults.
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getSessionUserFromRequest } from '@/lib/auth';
import RolePrivilege from '@/models/RolePrivilege';
import User from '@/models/User';
import { buildMenuTree, DEFAULT_ROLE_SLUGS } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUserFromRequest(req);

    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Unauthorized — please log in.' },
        { status: 401 }
      );
    }

    await connectDB();

    // 1. Get role-level slugs from RolePrivilege collection
    let roleSlugs: string[] = [];
    const rolePrivilege = await RolePrivilege.findOne({ role: sessionUser.role }).lean();

    if (rolePrivilege) {
      roleSlugs = rolePrivilege.menuSlugs;
    } else {
      // Fall back to static defaults if no DB record exists yet
      roleSlugs = DEFAULT_ROLE_SLUGS[sessionUser.role] || DEFAULT_ROLE_SLUGS['Field Employee'];
    }

    // 2. Merge user-level overrides (from menuPrivileges field)
    let userOverrideSlugs: string[] = sessionUser.menuPrivileges || [];
    if (userOverrideSlugs.length === 0) {
      // Fetch fresh from DB to ensure latest overrides
      const dbUser = await User.findById(sessionUser.id).select('menuPrivileges').lean();
      userOverrideSlugs = (dbUser?.menuPrivileges as string[]) || [];
    }

    // Union: role slugs + any user-specific overrides
    const allAuthorizedSlugs = Array.from(
      new Set([...roleSlugs, ...userOverrideSlugs])
    );

    // 3. Build nested NavGroup tree
    const menuTree = buildMenuTree(allAuthorizedSlugs);

    return NextResponse.json({
      role: sessionUser.role,
      authorizedMenus: menuTree,
      slugCount: allAuthorizedSlugs.length,
    });
  } catch (err) {
    console.error('[/api/rbac/menus] Error:', err);
    return NextResponse.json(
      { error: 'Failed to load menu configuration.' },
      { status: 500 }
    );
  }
}
