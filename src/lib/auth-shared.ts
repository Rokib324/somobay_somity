/**
 * auth-shared.ts — Client & Server safe auth utilities.
 * NO next/headers, NO next/server, NO mongoose imports here.
 */

// ─── Cooperative Role Hierarchy ───────────────────────────────────────────────
export type CooperativeRole =
  | 'Chairman'
  | 'Vice Chairman'
  | 'Secretary'
  | 'Treasurer'
  | 'Officer'
  | 'Field Employee';

export type LegacyRole =
  | 'Super Admin'
  | 'Branch Manager'
  | 'Operations In-Charge'
  | 'Teller'
  | 'Back-Office';

export type UserRole = CooperativeRole | LegacyRole;

export const COOPERATIVE_ROLES: CooperativeRole[] = [
  'Chairman',
  'Vice Chairman',
  'Secretary',
  'Treasurer',
  'Officer',
  'Field Employee',
];

export const LEGACY_ROLES: LegacyRole[] = [
  'Super Admin',
  'Branch Manager',
  'Operations In-Charge',
  'Teller',
  'Back-Office',
];

export const ALL_ROLES: UserRole[] = [...COOPERATIVE_ROLES, ...LEGACY_ROLES];

export const COOKIE_NAME = 'somity_auth';
export const SESSION_DURATION = '8h';
export const LOCK_DURATION_MINUTES = 30;
export const MAX_FAILED_ATTEMPTS = 5;
export const TELLER_DEFAULT_LIMIT = 50000;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch: string;
  transactionLimit: number;
  permissions: string[];
  menuPrivileges: string[];
  mustChangePassword: boolean;
}

// ─── Role Tier Maps ───────────────────────────────────────────────────────────
// Cooperative role tiers (1–10 scale)
export const COOPERATIVE_ROLE_TIER: Record<string, number> = {
  'Field Employee':  1,
  'Officer':         3,
  'Treasurer':       5,
  'Secretary':       6,
  'Vice Chairman':   8,
  'Chairman':        10,
};

// Legacy role tiers (mapped to equivalent cooperative tiers for middleware)
export const LEGACY_ROLE_TIER: Record<string, number> = {
  'Back-Office':          1,
  'Teller':               2,
  'Operations In-Charge': 3,
  'Branch Manager':       4,
  'Super Admin':          10, // Treated as Chairman-equivalent
};

/** Unified tier lookup — covers both cooperative and legacy roles */
export const ROLE_TIER: Record<string, number> = {
  ...LEGACY_ROLE_TIER,
  ...COOPERATIVE_ROLE_TIER,
};

// ─── Role UI Styling ──────────────────────────────────────────────────────────
export const ROLE_COLORS: Record<string, string> = {
  // Cooperative roles
  'Chairman':       'bg-yellow-100 text-yellow-900 border-yellow-300',
  'Vice Chairman':  'bg-purple-100 text-purple-800 border-purple-200',
  'Secretary':      'bg-blue-100 text-blue-800 border-blue-200',
  'Treasurer':      'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Officer':        'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Field Employee': 'bg-slate-100 text-slate-700 border-slate-300',
  // Legacy roles
  'Super Admin':          'bg-purple-100 text-purple-800 border-purple-200',
  'Branch Manager':       'bg-blue-100 text-blue-800 border-blue-200',
  'Operations In-Charge': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Teller':               'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Back-Office':          'bg-amber-100 text-amber-800 border-amber-200',
};

export const ROLE_ICONS: Record<string, string> = {
  // Cooperative roles
  'Chairman':       'fa-crown',
  'Vice Chairman':  'fa-shield-halved',
  'Secretary':      'fa-feather-pointed',
  'Treasurer':      'fa-vault',
  'Officer':        'fa-user-tie',
  'Field Employee': 'fa-person-walking',
  // Legacy roles
  'Super Admin':          'fa-user-shield',
  'Branch Manager':       'fa-building-user',
  'Operations In-Charge': 'fa-sliders',
  'Teller':               'fa-cash-register',
  'Back-Office':          'fa-keyboard',
};

// ─── Chairman-Only Helper ─────────────────────────────────────────────────────
/**
 * Strict check: returns true ONLY for Chairman or legacy Super Admin.
 * No other role can touch the privilege/role distribution system.
 */
export function isChairman(role: string): boolean {
  return role === 'Chairman' || role === 'Super Admin';
}

/** Check if role meets minimum required role tier */
export function hasMinRole(userRole: string, minRole: string): boolean {
  const userTier = ROLE_TIER[userRole] ?? 0;
  const minTier = ROLE_TIER[minRole] ?? 0;
  return userTier >= minTier;
}

/** Check if role is in an explicit list of allowed roles */
export function hasAnyRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}
