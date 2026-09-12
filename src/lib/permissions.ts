import type { UserRole } from '@/models/User';
import { hasMinRole } from './auth-shared';

/** Route permission rules — first match wins */
export interface RoutePermission {
  pattern: RegExp;
  minRole: UserRole;
  description: string;
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Super Admin only
  { pattern: /^\/settings\/users/, minRole: 'Super Admin', description: 'User management' },
  { pattern: /^\/settings\/privileges/, minRole: 'Super Admin', description: 'Menu privileges' },
  { pattern: /^\/api\/seed/, minRole: 'Super Admin', description: 'Database seeding' },

  // Branch Manager and above
  { pattern: /^\/loans\/disbursement/, minRole: 'Branch Manager', description: 'Loan disbursement' },
  { pattern: /^\/accounts\/profit-loss/, minRole: 'Branch Manager', description: 'P&L report' },
  { pattern: /^\/accounts\/income-statement/, minRole: 'Branch Manager', description: 'Income statement' },
  { pattern: /^\/api\/loans\/disbursement/, minRole: 'Branch Manager', description: 'Loan disbursement API' },

  // Operations In-Charge and above
  { pattern: /^\/loans\/approvals/, minRole: 'Operations In-Charge', description: 'Loan approvals' },
  { pattern: /^\/hr\/payroll/, minRole: 'Operations In-Charge', description: 'Payroll management' },
  { pattern: /^\/hr\/shifts/, minRole: 'Operations In-Charge', description: 'Shift management' },
  { pattern: /^\/hr\/duty-roster/, minRole: 'Operations In-Charge', description: 'Duty roster' },
  { pattern: /^\/accounts\/general-ledger/, minRole: 'Operations In-Charge', description: 'General ledger' },
  { pattern: /^\/accounts\/trial-balance/, minRole: 'Operations In-Charge', description: 'Trial balance' },
  { pattern: /^\/api\/hr\/payroll/, minRole: 'Operations In-Charge', description: 'Payroll API' },
  { pattern: /^\/api\/loans\/approvals/, minRole: 'Operations In-Charge', description: 'Loan approvals API' },

  // Teller and above (basic operations)
  { pattern: /^\/savings\/withdrawals/, minRole: 'Teller', description: 'Savings withdrawals' },
  { pattern: /^\/savings\/deposits/, minRole: 'Teller', description: 'Savings deposits' },
  { pattern: /^\/savings\/collections/, minRole: 'Teller', description: 'Savings collections' },
  { pattern: /^\/collections/, minRole: 'Teller', description: 'Collections module' },
  { pattern: /^\/accounts\/payment/, minRole: 'Teller', description: 'Voucher payment' },
  { pattern: /^\/api\/savings/, minRole: 'Teller', description: 'Savings API' },

  // Back-Office and above (everyone with a valid session)
  { pattern: /^\/reports/, minRole: 'Back-Office', description: 'Financial reports' },
  { pattern: /^\/accounts/, minRole: 'Back-Office', description: 'Accounts module' },
  { pattern: /^\/members/, minRole: 'Back-Office', description: 'Members module' },
  { pattern: /^\/loans/, minRole: 'Back-Office', description: 'Loans module' },
  { pattern: /^\/savings/, minRole: 'Back-Office', description: 'Savings module' },
  { pattern: /^\/hr/, minRole: 'Back-Office', description: 'HR module' },
  { pattern: /^\/sms/, minRole: 'Back-Office', description: 'SMS module' },
  { pattern: /^\/settings/, minRole: 'Back-Office', description: 'Settings module' },
  { pattern: /^\/dashboard/, minRole: 'Back-Office', description: 'Dashboard' },
  { pattern: /^\/api\//, minRole: 'Back-Office', description: 'General API' },
];

/** Return the required role for a given path, or null if no restriction */
export function getRequiredRole(pathname: string): UserRole | null {
  for (const rule of ROUTE_PERMISSIONS) {
    if (rule.pattern.test(pathname)) {
      return rule.minRole;
    }
  }
  return null;
}

/** Check if a role is allowed on a path */
export function isAllowed(pathname: string, userRole: UserRole): boolean {
  const required = getRequiredRole(pathname);
  if (!required) return true;
  return hasMinRole(userRole, required);
}

/** Sidebar nav items visible to each role */
export function getVisibleNavItems(role: UserRole): string[] {
  const all = [
    'Dashboard',
    'Accounts', 'Members', 'Savings', 'Loans',
    'HR & Attendance', 'SMS Communications', 'Settings', 'Financial Reports',
  ];

  const roleVisibility: Record<UserRole, string[]> = {
    'Super Admin': all,
    'Branch Manager': [
      'Dashboard', 'Accounts', 'Members', 'Savings', 'Loans',
      'HR & Attendance', 'SMS Communications', 'Settings', 'Financial Reports',
    ],
    'Operations In-Charge': [
      'Dashboard', 'Accounts', 'Members', 'Savings', 'Loans',
      'HR & Attendance', 'SMS Communications', 'Financial Reports',
    ],
    'Teller': [
      'Dashboard', 'Members', 'Savings', 'Loans', 'SMS Communications',
    ],
    'Back-Office': [
      'Dashboard', 'Accounts', 'Members', 'Loans', 'Financial Reports',
    ],
  };

  return roleVisibility[role] ?? ['Dashboard'];
}

/** Submenu items visible per role */
export function getVisibleSubItems(role: UserRole): Record<string, string[]> {
  const tier = (r: UserRole) => hasMinRole(role, r);

  return {
    Accounts: [
      'Overview',
      'Account Description',
      'Account Groups',
      'Chart of Accounts',
      ...(tier('Operations In-Charge') ? ['General Ledger', 'Trial Balance'] : []),
      ...(tier('Branch Manager') ? ['Income Statement', 'Profit & Loss'] : []),
      'Cost Center', 'Sub-Ledger Report', 'Sub-Ledger Type', 'Integration Policy',
      ...(tier('Teller') ? ['Voucher Payment'] : []),
    ],
    Members: ['All Members List', 'Member Categories', 'Member Transfers', 'Member Profile Preview'],
    Savings: [
      'Deposit Accounts',
      ...(tier('Teller') ? ['Savings Collection', 'New Savings Account', 'Savings Types / Plans', 'Withdrawal List', 'New Withdrawal Apply'] : []),
    ],
    Loans: [
      'Loan Accounts',
      ...(tier('Teller') ? ['Repayment Schedules', 'Due Collections', 'Daily Collection', 'Advance Collections'] : []),
      ...(tier('Operations In-Charge') ? ['Loan Approvals', 'Interest Setup', 'Loan Products'] : []),
      ...(tier('Branch Manager') ? ['Loan Disbursement', 'Loan Closing'] : []),
    ],
    'HR & Attendance': [
      'Employee List',
      'Daily Attendance',
      'Monthly Attendance Report',
      'Leave Applications',
      'Apply for Leave',
      ...(tier('Operations In-Charge') ? ['Payroll & Salaries', 'Shift Management', 'Duty Roster'] : []),
    ],
    'SMS Communications': ['Send Single SMS', 'Send Bulk SMS', 'SMS Log History'],
    Settings: [
      'General Settings',
      'Branch Setup',
      ...(tier('Super Admin') ? ['Manage Users', 'Menu Privilege List', 'Add Menu Item'] : []),
    ],
  };
}
