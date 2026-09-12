/**
 * auth-shared.ts — Client & Server safe auth utilities.
 * NO next/headers, NO next/server imports here.
 */
import type { UserRole } from '@/models/User';

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
  mustChangePassword: boolean;
}

/** Role numeric tiers — higher = more authority */
export const ROLE_TIER: Record<UserRole, number> = {
  'Back-Office': 1,
  'Teller': 2,
  'Operations In-Charge': 3,
  'Branch Manager': 4,
  'Super Admin': 5,
};

export const ROLE_COLORS: Record<UserRole, string> = {
  'Super Admin': 'bg-purple-100 text-purple-800 border-purple-200',
  'Branch Manager': 'bg-blue-100 text-blue-800 border-blue-200',
  'Operations In-Charge': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Teller': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Back-Office': 'bg-amber-100 text-amber-800 border-amber-200',
};

export const ROLE_ICONS: Record<UserRole, string> = {
  'Super Admin': 'fa-crown',
  'Branch Manager': 'fa-building-columns',
  'Operations In-Charge': 'fa-shield-halved',
  'Teller': 'fa-cash-register',
  'Back-Office': 'fa-magnifying-glass-chart',
};

/** Check if a user has at least the minimum role tier */
export function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
  return (ROLE_TIER[userRole] ?? 0) >= (ROLE_TIER[minRole] ?? 99);
}
