/**
 * /api/rbac/roles
 *
 * GET  — Returns all roles with their current authorized menu slugs.
 *         CHAIRMAN ONLY. Returns 403 for every other role.
 *
 * PUT  — Updates a role's authorized menu slugs.
 *         CHAIRMAN ONLY. Returns 403 with explicit error for every other role.
 *         Body: { role: string; menuSlugs: string[] }
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireChairman } from '@/lib/auth';
import RolePrivilege from '@/models/RolePrivilege';
import { MENU_CATALOG, DEFAULT_ROLE_SLUGS } from '@/lib/permissions';
import { ALL_ROLES } from '@/models/User';

// GET /api/rbac/roles — Chairman only
export async function GET(req: NextRequest) {
  let chairman;
  try {
    chairman = await requireChairman(req);
  } catch (forbidden) {
    return forbidden as Response;
  }

  try {
    await connectDB();

    // Fetch all role privilege records
    const records = await RolePrivilege.find({}).lean();
    const recordMap = new Map(records.map(r => [r.role, r.menuSlugs]));

    // Build a complete matrix for all known roles
    const allRoles = ALL_ROLES;
    const matrix = allRoles.map(role => ({
      role,
      menuSlugs: recordMap.get(role) ?? DEFAULT_ROLE_SLUGS[role] ?? [],
      hasDbRecord: recordMap.has(role),
    }));

    return NextResponse.json({
      requestedBy: { id: chairman.id, name: chairman.name, role: chairman.role },
      roles: matrix,
      totalMenuItems: MENU_CATALOG.length,
    });
  } catch (err) {
    console.error('[GET /api/rbac/roles] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch role privilege configurations.' },
      { status: 500 }
    );
  }
}

// PUT /api/rbac/roles — Chairman only
export async function PUT(req: NextRequest) {
  let chairman;
  try {
    chairman = await requireChairman(req);
  } catch (forbidden) {
    return forbidden as Response;
  }

  try {
    await connectDB();

    const body = await req.json();
    const { role, menuSlugs } = body as { role: string; menuSlugs: string[] };

    // Validate inputs
    if (!role || !Array.isArray(menuSlugs)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected: { role: string, menuSlugs: string[] }' },
        { status: 400 }
      );
    }

    // Ensure the role is known
    if (!ALL_ROLES.includes(role as typeof ALL_ROLES[number])) {
      return NextResponse.json(
        { error: `Unknown role: "${role}". Must be one of: ${ALL_ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate slugs against catalog
    const validSlugs = new Set(MENU_CATALOG.map(m => m.slug));
    const invalidSlugs = menuSlugs.filter(s => !validSlugs.has(s));
    if (invalidSlugs.length > 0) {
      return NextResponse.json(
        { error: `Invalid menu slugs: ${invalidSlugs.join(', ')}. Must be slugs from MENU_CATALOG.` },
        { status: 400 }
      );
    }

    // Upsert the role privilege document
    const updated = await RolePrivilege.findOneAndUpdate(
      { role },
      {
        menuSlugs: [...new Set(menuSlugs)], // deduplicate
        updatedBy: chairman.id,
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      role: updated.role,
      menuSlugsCount: updated.menuSlugs.length,
      updatedAt: updated.updatedAt,
      updatedBy: { id: chairman.id, name: chairman.name },
    });
  } catch (err) {
    console.error('[PUT /api/rbac/roles] Error:', err);
    return NextResponse.json(
      { error: 'Failed to update role privileges.' },
      { status: 500 }
    );
  }
}
