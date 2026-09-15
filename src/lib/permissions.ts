/**
 * permissions.ts
 * Master menu catalog, route permission rules, and RBAC helpers.
 *
 * MENU_CATALOG is the single source of truth for all navigable routes.
 * RolePrivilege documents store slugs from this catalog.
 * buildMenuTree() converts a flat slug array → nested NavGroup[] for the sidebar.
 */
import { hasMinRole } from './auth-shared';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MenuCatalogItem {
  slug: string;
  label: string;
  href: string;
  icon?: string;          // FontAwesome class (parent items only)
  parentSlug?: string;    // undefined = top-level / parent item
  group: string;          // Sidebar section header
  order: number;          // Display order within parent
}

export interface NavSubItem {
  slug: string;
  label: string;
  href: string;
}

export interface NavItem {
  slug: string;
  label: string;
  href: string;
  icon: string;
  submenu: NavSubItem[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

// ─── Master Menu Catalog ──────────────────────────────────────────────────────
// Every navigable route in the ERP lives here.
// "slug" is the stable identifier stored in RolePrivilege.menuSlugs.
export const MENU_CATALOG: MenuCatalogItem[] = [
  // ── Core ──────────────────────────────────────────────────────────────────
  { slug: 'dashboard',             label: 'Dashboard',             href: '/dashboard',                    icon: 'fa-solid fa-chart-line',          group: 'CORE OPERATIVE',          order: 1 },

  // ── Accounts ──────────────────────────────────────────────────────────────
  { slug: 'accounts',              label: 'Accounts',              href: '/accounts',                     icon: 'fa-solid fa-scale-balanced',      group: 'ACCOUNTS MODULE',         order: 1 },
  { slug: 'accounts-overview',     label: 'Overview',              href: '/accounts',                     parentSlug: 'accounts',                  group: 'ACCOUNTS MODULE',         order: 1 },
  { slug: 'accounts-description',  label: 'Account Description',   href: '/accounts/description',         parentSlug: 'accounts',                  group: 'ACCOUNTS MODULE',         order: 2 },
  { slug: 'accounts-groups',       label: 'Account Groups',        href: '/accounts/group',               parentSlug: 'accounts',                  group: 'ACCOUNTS MODULE',         order: 3 },
  { slug: 'accounts-chart',        label: 'Chart of Accounts',     href: '/accounts/chart-of-accounts',   parentSlug: 'accounts',                  group: 'ACCOUNTS MODULE',         order: 4 },
  { slug: 'accounts-ledger',       label: 'General Ledger',        href: '/accounts/general-ledger',      parentSlug: 'accounts',                  group: 'ACCOUNTS MODULE',         order: 5 },
  { slug: 'accounts-trial',        label: 'Trial Balance',         href: '/accounts/trial-balance',       parentSlug: 'accounts',                  group: 'ACCOUNTS MODULE',         order: 6 },
  { slug: 'accounts-income',       label: 'Income Statement',      href: '/accounts/income-statement',    parentSlug: 'accounts',                  group: 'ACCOUNTS MODULE',         order: 7 },
  { slug: 'accounts-profit-loss',  label: 'Profit & Loss',         href: '/accounts/profit-loss',         parentSlug: 'accounts',                  group: 'ACCOUNTS MODULE',         order: 8 },
  { slug: 'accounts-cost-center',  label: 'Cost Center',           href: '/accounts/cost-center',         parentSlug: 'accounts',                  group: 'ACCOUNTS MODULE',         order: 9 },
  { slug: 'accounts-sub-ledger',   label: 'Sub-Ledger Report',     href: '/accounts/sub-ledger-report',   parentSlug: 'accounts',                  group: 'ACCOUNTS MODULE',         order: 10 },
  { slug: 'accounts-sub-type',     label: 'Sub-Ledger Type',       href: '/accounts/sub-ledger-type',     parentSlug: 'accounts',                  group: 'ACCOUNTS MODULE',         order: 11 },
  { slug: 'accounts-integration',  label: 'Integration Policy',    href: '/accounts/integration-policy',  parentSlug: 'accounts',                  group: 'ACCOUNTS MODULE',         order: 12 },
  { slug: 'accounts-payment',      label: 'Voucher Payment',       href: '/accounts/payment',             parentSlug: 'accounts',                  group: 'ACCOUNTS MODULE',         order: 13 },

  // ── Members ───────────────────────────────────────────────────────────────
  { slug: 'members',               label: 'Members',               href: '/members',                      icon: 'fa-solid fa-users',               group: 'MEMBERS MODULE',          order: 1 },
  { slug: 'members-list',          label: 'All Members List',      href: '/members',                      parentSlug: 'members',                   group: 'MEMBERS MODULE',          order: 1 },
  { slug: 'members-categories',    label: 'Member Categories',     href: '/members/categories',           parentSlug: 'members',                   group: 'MEMBERS MODULE',          order: 2 },
  { slug: 'members-transfers',     label: 'Member Transfers',      href: '/members/transfers',            parentSlug: 'members',                   group: 'MEMBERS MODULE',          order: 3 },

  // ── Savings ───────────────────────────────────────────────────────────────
  { slug: 'savings',               label: 'Savings',               href: '/savings/deposits',             icon: 'fa-solid fa-piggy-bank',          group: 'SAVINGS & DEPOSITS',      order: 1 },
  { slug: 'savings-deposits',      label: 'Deposit Accounts',      href: '/savings/deposits',             parentSlug: 'savings',                   group: 'SAVINGS & DEPOSITS',      order: 1 },
  { slug: 'savings-collection',    label: 'Savings Collection',    href: '/savings/collections',          parentSlug: 'savings',                   group: 'SAVINGS & DEPOSITS',      order: 2 },
  { slug: 'savings-create',        label: 'New Savings Account',   href: '/savings/create',               parentSlug: 'savings',                   group: 'SAVINGS & DEPOSITS',      order: 3 },
  { slug: 'savings-types',         label: 'Savings Types / Plans', href: '/savings/types',                parentSlug: 'savings',                   group: 'SAVINGS & DEPOSITS',      order: 4 },
  { slug: 'savings-withdrawals',   label: 'Withdrawal List',       href: '/savings/withdrawals',          parentSlug: 'savings',                   group: 'SAVINGS & DEPOSITS',      order: 5 },
  { slug: 'savings-withdraw-apply',label: 'New Withdrawal Apply',  href: '/savings/withdrawals/apply',    parentSlug: 'savings',                   group: 'SAVINGS & DEPOSITS',      order: 6 },

  // ── Loans ─────────────────────────────────────────────────────────────────
  { slug: 'loans',                 label: 'Loans',                 href: '/loans',                        icon: 'fa-solid fa-hand-holding-dollar', group: 'LOANS & COLLECTIONS',     order: 1 },
  { slug: 'loans-list',            label: 'All Loan Accounts',     href: '/loans',                        parentSlug: 'loans',                     group: 'LOANS & COLLECTIONS',     order: 1 },
  { slug: 'loans-products',        label: 'Loan Products',         href: '/loans/products',               parentSlug: 'loans',                     group: 'LOANS & COLLECTIONS',     order: 2 },
  { slug: 'loans-apply',           label: 'Apply for Loan',        href: '/loans/apply',                  parentSlug: 'loans',                     group: 'LOANS & COLLECTIONS',     order: 3 },
  { slug: 'loans-approvals',       label: 'Loan Approvals',        href: '/loans/approvals',              parentSlug: 'loans',                     group: 'LOANS & COLLECTIONS',     order: 4 },
  { slug: 'loans-disbursement',    label: 'Loan Disbursement',     href: '/loans/disbursement',           parentSlug: 'loans',                     group: 'LOANS & COLLECTIONS',     order: 5 },
  { slug: 'loans-schedules',       label: 'Repayment Schedules',   href: '/loans/schedules',              parentSlug: 'loans',                     group: 'LOANS & COLLECTIONS',     order: 6 },
  { slug: 'loans-closing',         label: 'Loan Closing',          href: '/loans/closing',                parentSlug: 'loans',                     group: 'LOANS & COLLECTIONS',     order: 7 },
  { slug: 'loans-interest',        label: 'Interest Setup',        href: '/loans/interest-setup',         parentSlug: 'loans',                     group: 'LOANS & COLLECTIONS',     order: 8 },
  { slug: 'collections',           label: 'Collections Desk',      href: '/collections',                  icon: 'fa-solid fa-cash-register',       group: 'LOANS & COLLECTIONS',     order: 2 },
  { slug: 'collections-centralized',label:'Centralized Collections',href: '/collections',                 parentSlug: 'collections',               group: 'LOANS & COLLECTIONS',     order: 1 },
  { slug: 'collections-daily',     label: 'Daily Field Sheet',     href: '/collections/daily',            parentSlug: 'collections',               group: 'LOANS & COLLECTIONS',     order: 2 },
  { slug: 'collections-due',       label: 'Due Recovery List',     href: '/collections/due',              parentSlug: 'collections',               group: 'LOANS & COLLECTIONS',     order: 3 },
  { slug: 'collections-advance',   label: 'Advance Collections',   href: '/collections/advance',          parentSlug: 'collections',               group: 'LOANS & COLLECTIONS',     order: 4 },

  // ── HR ────────────────────────────────────────────────────────────────────
  { slug: 'hr',                    label: 'HR & Attendance',       href: '/hr/employees',                 icon: 'fa-solid fa-user-gear',           group: 'HUMAN RESOURCES',         order: 1 },
  { slug: 'hr-employees',          label: 'Employee List',         href: '/hr/employees',                 parentSlug: 'hr',                        group: 'HUMAN RESOURCES',         order: 1 },
  { slug: 'hr-attendance',         label: 'Daily Attendance',      href: '/hr/attendance',                parentSlug: 'hr',                        group: 'HUMAN RESOURCES',         order: 2 },
  { slug: 'hr-attendance-monthly', label: 'Monthly Attendance',    href: '/hr/attendance/monthly',        parentSlug: 'hr',                        group: 'HUMAN RESOURCES',         order: 3 },
  { slug: 'hr-leave-list',         label: 'Leave Applications',    href: '/hr/leave/list',                parentSlug: 'hr',                        group: 'HUMAN RESOURCES',         order: 4 },
  { slug: 'hr-leave-apply',        label: 'Apply for Leave',       href: '/hr/leave/apply',               parentSlug: 'hr',                        group: 'HUMAN RESOURCES',         order: 5 },
  { slug: 'hr-payroll',            label: 'Payroll & Salaries',    href: '/hr/payroll',                   parentSlug: 'hr',                        group: 'HUMAN RESOURCES',         order: 6 },
  { slug: 'hr-shifts',             label: 'Shift Management',      href: '/hr/shifts',                    parentSlug: 'hr',                        group: 'HUMAN RESOURCES',         order: 7 },
  { slug: 'hr-duty-roster',        label: 'Duty Roster',           href: '/hr/duty-roster',               parentSlug: 'hr',                        group: 'HUMAN RESOURCES',         order: 8 },

  // ── Admin & System ────────────────────────────────────────────────────────
  { slug: 'sms',                   label: 'SMS Communications',    href: '/sms/send',                     icon: 'fa-solid fa-paper-plane',         group: 'ADMIN & SYSTEM',          order: 1 },
  { slug: 'sms-send',              label: 'Send Single SMS',       href: '/sms/send',                     parentSlug: 'sms',                       group: 'ADMIN & SYSTEM',          order: 1 },
  { slug: 'sms-bulk',              label: 'Send Bulk SMS',         href: '/sms/bulk',                     parentSlug: 'sms',                       group: 'ADMIN & SYSTEM',          order: 2 },
  { slug: 'sms-history',           label: 'SMS Log History',       href: '/sms/history',                  parentSlug: 'sms',                       group: 'ADMIN & SYSTEM',          order: 3 },
  { slug: 'settings',              label: 'Settings',              href: '/settings',                     icon: 'fa-solid fa-sliders',             group: 'ADMIN & SYSTEM',          order: 2 },
  { slug: 'settings-general',      label: 'General Settings',      href: '/settings',                     parentSlug: 'settings',                  group: 'ADMIN & SYSTEM',          order: 1 },
  { slug: 'settings-branches',     label: 'Branch Setup',          href: '/settings/branches',            parentSlug: 'settings',                  group: 'ADMIN & SYSTEM',          order: 2 },
  { slug: 'settings-users',        label: 'Manage Users',          href: '/settings/users',               parentSlug: 'settings',                  group: 'ADMIN & SYSTEM',          order: 3 },
  { slug: 'settings-privileges',   label: 'Menu Privilege Matrix', href: '/settings/privileges',          parentSlug: 'settings',                  group: 'ADMIN & SYSTEM',          order: 4 },
  { slug: 'settings-menus-add',    label: 'Add Menu Item',         href: '/settings/menus/add',           parentSlug: 'settings',                  group: 'ADMIN & SYSTEM',          order: 5 },
  { slug: 'reports',               label: 'Financial Reports',     href: '/reports',                      icon: 'fa-solid fa-file-invoice',        group: 'ADMIN & SYSTEM',          order: 3 },
];

// ─── Default Role Slugs ───────────────────────────────────────────────────────
// Used to seed RolePrivilege documents on first run.
export const DEFAULT_ROLE_SLUGS: Record<string, string[]> = {
  'Chairman': MENU_CATALOG.map(m => m.slug), // Full access

  'Vice Chairman': MENU_CATALOG
    .filter(m => !['settings-users', 'settings-privileges', 'settings-menus-add'].includes(m.slug))
    .map(m => m.slug),

  'Secretary': [
    'dashboard',
    'members', 'members-list', 'members-categories', 'members-transfers',
    'loans', 'loans-list', 'loans-products', 'loans-apply', 'loans-approvals',
    'loans-schedules', 'loans-closing', 'loans-interest',
    'collections', 'collections-centralized', 'collections-daily', 'collections-due', 'collections-advance',
    'accounts', 'accounts-overview', 'accounts-description', 'accounts-groups',
    'accounts-chart', 'accounts-ledger', 'accounts-trial', 'accounts-income', 'accounts-profit-loss',
    'sms', 'sms-send', 'sms-bulk', 'sms-history',
    'reports',
    'hr', 'hr-employees', 'hr-attendance', 'hr-attendance-monthly', 'hr-leave-list', 'hr-leave-apply',
    'settings', 'settings-general', 'settings-branches',
  ],

  'Treasurer': [
    'dashboard',
    'accounts', 'accounts-overview', 'accounts-description', 'accounts-groups',
    'accounts-chart', 'accounts-ledger', 'accounts-trial', 'accounts-income', 'accounts-profit-loss',
    'accounts-cost-center', 'accounts-sub-ledger', 'accounts-sub-type', 'accounts-integration', 'accounts-payment',
    'savings', 'savings-deposits', 'savings-collection', 'savings-create', 'savings-types',
    'savings-withdrawals', 'savings-withdraw-apply',
    'reports',
    'members', 'members-list',
    'loans', 'loans-list', 'loans-schedules',
  ],

  'Officer': [
    'dashboard',
    'members', 'members-list', 'members-categories', 'members-transfers',
    'loans', 'loans-list', 'loans-apply', 'loans-schedules',
    'collections', 'collections-centralized', 'collections-daily', 'collections-due', 'collections-advance',
    'savings', 'savings-deposits', 'savings-collection',
    'sms', 'sms-send', 'sms-history',
    'hr', 'hr-employees', 'hr-attendance', 'hr-leave-list', 'hr-leave-apply',
  ],

  'Field Employee': [
    'dashboard',
    'members', 'members-list',
    'collections', 'collections-centralized', 'collections-daily', 'collections-due',
    'savings', 'savings-deposits', 'savings-collection',
    'loans', 'loans-list',
    'hr', 'hr-attendance', 'hr-leave-apply',
  ],

  // Legacy role defaults (for existing users)
  'Super Admin': MENU_CATALOG.map(m => m.slug),
  'Branch Manager': MENU_CATALOG.filter(m =>
    !['settings-users', 'settings-privileges'].includes(m.slug)
  ).map(m => m.slug),
  'Operations In-Charge': [
    'dashboard', 'accounts', 'accounts-overview', 'accounts-description', 'accounts-groups',
    'accounts-chart', 'accounts-ledger', 'accounts-trial', 'accounts-cost-center',
    'accounts-sub-ledger', 'accounts-sub-type', 'accounts-integration', 'accounts-payment',
    'members', 'members-list', 'members-categories', 'members-transfers',
    'savings', 'savings-deposits', 'savings-collection', 'savings-create', 'savings-types',
    'savings-withdrawals', 'savings-withdraw-apply',
    'loans', 'loans-list', 'loans-products', 'loans-apply', 'loans-approvals',
    'loans-schedules', 'loans-interest',
    'collections', 'collections-centralized', 'collections-daily', 'collections-due', 'collections-advance',
    'hr', 'hr-employees', 'hr-attendance', 'hr-attendance-monthly', 'hr-leave-list', 'hr-leave-apply',
    'hr-payroll', 'hr-shifts', 'hr-duty-roster',
    'sms', 'sms-send', 'sms-bulk', 'sms-history',
    'reports', 'settings', 'settings-general', 'settings-branches',
  ],
  'Teller': [
    'dashboard',
    'members', 'members-list', 'members-categories', 'members-transfers',
    'savings', 'savings-deposits', 'savings-collection', 'savings-create', 'savings-types',
    'savings-withdrawals', 'savings-withdraw-apply',
    'loans', 'loans-list', 'loans-apply', 'loans-schedules',
    'collections', 'collections-centralized', 'collections-daily', 'collections-due', 'collections-advance',
    'sms', 'sms-send', 'sms-history',
    'hr', 'hr-attendance', 'hr-leave-list', 'hr-leave-apply',
  ],
  'Back-Office': [
    'dashboard',
    'members', 'members-list', 'members-categories',
    'accounts', 'accounts-overview', 'accounts-description', 'accounts-groups', 'accounts-chart',
    'loans', 'loans-list', 'loans-schedules',
    'reports',
  ],
};

// ─── buildMenuTree ────────────────────────────────────────────────────────────
/**
 * Converts a flat array of authorized menu slugs into a nested NavGroup[]
 * suitable for rendering the sidebar. Only items whose slugs are in the
 * authorized set will appear.
 */
export function buildMenuTree(authorizedSlugs: string[]): NavGroup[] {
  const slugSet = new Set(authorizedSlugs);

  // Get top-level parent items that the user can see
  const parents = MENU_CATALOG
    .filter(m => !m.parentSlug && slugSet.has(m.slug))
    .sort((a, b) => a.order - b.order);

  // Get all groups in order they appear
  const groupOrder: string[] = [];
  const seen = new Set<string>();
  for (const m of MENU_CATALOG) {
    if (!seen.has(m.group)) {
      groupOrder.push(m.group);
      seen.add(m.group);
    }
  }

  const groupMap: Map<string, NavItem[]> = new Map();
  groupOrder.forEach(g => groupMap.set(g, []));

  for (const parent of parents) {
    // Build submenu from authorized children
    const submenu: NavSubItem[] = MENU_CATALOG
      .filter(m => m.parentSlug === parent.slug && slugSet.has(m.slug))
      .sort((a, b) => a.order - b.order)
      .map(m => ({ slug: m.slug, label: m.label, href: m.href }));

    const navItem: NavItem = {
      slug: parent.slug,
      label: parent.label,
      href: parent.href,
      icon: parent.icon || 'fa-solid fa-circle',
      submenu,
    };

    const groupItems = groupMap.get(parent.group) || [];
    groupItems.push(navItem);
    groupMap.set(parent.group, groupItems);
  }

  return groupOrder
    .map(title => ({ title, items: groupMap.get(title) || [] }))
    .filter(g => g.items.length > 0);
}

// ─── Legacy helpers (kept for backward compatibility) ─────────────────────────
export interface RoutePermission {
  pattern: RegExp;
  minRole: string;
  description: string;
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  { pattern: /^\/settings\/users/,       minRole: 'Chairman',           description: 'User management' },
  { pattern: /^\/settings\/privileges/,  minRole: 'Chairman',           description: 'Menu privileges' },
  { pattern: /^\/api\/rbac\/roles/,       minRole: 'Chairman',           description: 'Role management API' },
  { pattern: /^\/api\/rbac\/assign-role/, minRole: 'Chairman',           description: 'Role assignment API' },
  { pattern: /^\/api\/seed/,             minRole: 'Chairman',           description: 'Database seeding' },
  { pattern: /^\/loans\/disbursement/,   minRole: 'Vice Chairman',      description: 'Loan disbursement' },
  { pattern: /^\/accounts\/profit-loss/, minRole: 'Treasurer',          description: 'P&L report' },
  { pattern: /^\/loans\/approvals/,      minRole: 'Secretary',          description: 'Loan approvals' },
  { pattern: /^\/hr\/payroll/,           minRole: 'Secretary',          description: 'Payroll management' },
  { pattern: /^\/dashboard/,            minRole: 'Field Employee',     description: 'Dashboard' },
  { pattern: /^\/api\//,                minRole: 'Field Employee',     description: 'General API' },
];

export function getRequiredRole(pathname: string): string | null {
  for (const rule of ROUTE_PERMISSIONS) {
    if (rule.pattern.test(pathname)) return rule.minRole;
  }
  return null;
}

export function isAllowed(pathname: string, userRole: string): boolean {
  const required = getRequiredRole(pathname);
  if (!required) return true;
  return hasMinRole(userRole, required);
}

/** @deprecated Use buildMenuTree() with RBAC slugs instead */
export function getVisibleNavItems(role: string): string[] {
  const slugs = DEFAULT_ROLE_SLUGS[role] || DEFAULT_ROLE_SLUGS['Field Employee'];
  const parents = MENU_CATALOG
    .filter(m => !m.parentSlug && slugs.includes(m.slug))
    .map(m => m.label);
  return parents;
}

/** @deprecated Use buildMenuTree() with RBAC slugs instead */
export function getVisibleSubItems(role: string): Record<string, string[]> {
  const slugs = DEFAULT_ROLE_SLUGS[role] || [];
  const result: Record<string, string[]> = {};
  for (const item of MENU_CATALOG.filter(m => !m.parentSlug)) {
    const children = MENU_CATALOG
      .filter(m => m.parentSlug === item.slug && slugs.includes(m.slug))
      .map(m => m.label);
    if (children.length) result[item.label] = children;
  }
  return result;
}
