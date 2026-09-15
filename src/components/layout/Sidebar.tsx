'use client';

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_ICONS, ROLE_COLORS, type UserRole } from '@/lib/auth-shared';
import { getVisibleNavItems, getVisibleSubItems } from '@/lib/permissions';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  submenu?: { label: string; href: string }[];
}

const ALL_NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'CORE OPERATIVE',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'fa-solid fa-chart-line' },
    ],
  },
  {
    title: 'ACCOUNTS MODULE',
    items: [
      {
        label: 'Accounts',
        href: '/accounts',
        icon: 'fa-solid fa-scale-balanced',
        submenu: [
          { label: 'Overview', href: '/accounts' },
          { label: 'Account Description', href: '/accounts/description' },
          { label: 'Account Groups', href: '/accounts/group' },
          { label: 'Chart of Accounts', href: '/accounts/chart-of-accounts' },
          { label: 'General Ledger', href: '/accounts/general-ledger' },
          { label: 'Trial Balance', href: '/accounts/trial-balance' },
          { label: 'Income Statement', href: '/accounts/income-statement' },
          { label: 'Profit & Loss', href: '/accounts/profit-loss' },
          { label: 'Cost Center', href: '/accounts/cost-center' },
          { label: 'Sub-Ledger Report', href: '/accounts/sub-ledger-report' },
          { label: 'Sub-Ledger Type', href: '/accounts/sub-ledger-type' },
          { label: 'Integration Policy', href: '/accounts/integration-policy' },
          { label: 'Voucher Payment', href: '/accounts/payment' },
        ],
      },
    ],
  },
  {
    title: 'MEMBERS MODULE',
    items: [
      {
        label: 'Members',
        href: '/members',
        icon: 'fa-solid fa-users',
        submenu: [
          { label: 'All Members List', href: '/members' },
          { label: 'Member Categories', href: '/members/categories' },
          { label: 'Member Transfers', href: '/members/transfers' },
          { label: 'Member Profile Preview', href: '/members/MEM-001' },
        ],
      },
    ],
  },
  {
    title: 'SAVINGS & DEPOSITS',
    items: [
      {
        label: 'Savings',
        href: '/savings/deposits',
        icon: 'fa-solid fa-piggy-bank',
        submenu: [
          { label: 'Deposit Accounts', href: '/savings/deposits' },
          { label: 'Savings Collection', href: '/savings/collections' },
          { label: 'New Savings Account', href: '/savings/create' },
          { label: 'Savings Types / Plans', href: '/savings/types' },
          { label: 'Withdrawal List', href: '/savings/withdrawals' },
          { label: 'New Withdrawal Apply', href: '/savings/withdrawals/apply' },
        ],
      },
    ],
  },
  {
    title: 'LOANS & COLLECTIONS',
    items: [
      {
        label: 'Loans',
        href: '/loans',
        icon: 'fa-solid fa-hand-holding-dollar',
        submenu: [
          { label: 'All Loan Accounts', href: '/loans' },
          { label: '1. Loan Products', href: '/loans/products' },
          { label: '2. Apply for Loan', href: '/loans/apply' },
          { label: '3. Loan Approvals', href: '/loans/approvals' },
          { label: '4. Loan Disbursement', href: '/loans/disbursement' },
          { label: '5. Repayment Schedules', href: '/loans/schedules' },
          { label: '6. Loan Closing', href: '/loans/closing' },
          { label: 'Interest Setup', href: '/loans/interest-setup' },
        ],
      },
      {
        label: 'Collections Desk',
        href: '/collections',
        icon: 'fa-solid fa-cash-register',
        submenu: [
          { label: 'Centralized Collections', href: '/collections' },
          { label: 'Daily Field Sheet', href: '/collections/daily' },
          { label: 'Due Recovery List', href: '/collections/due' },
          { label: 'Advance Collections', href: '/collections/advance' },
        ],
      },
    ],
  },
  {
    title: 'HUMAN RESOURCES',
    items: [
      {
        label: 'HR & Attendance',
        href: '/hr/employees',
        icon: 'fa-solid fa-user-gear',
        submenu: [
          { label: 'Employee List', href: '/hr/employees' },
          { label: 'Daily Attendance', href: '/hr/attendance' },
          { label: 'Monthly Attendance Report', href: '/hr/attendance/monthly' },
          { label: 'Leave Applications', href: '/hr/leave/list' },
          { label: 'Apply for Leave', href: '/hr/leave/apply' },
          { label: 'Payroll & Salaries', href: '/hr/payroll' },
          { label: 'Shift Management', href: '/hr/shifts' },
          { label: 'Duty Roster', href: '/hr/duty-roster' },
        ],
      },
    ],
  },
  {
    title: 'ADMIN & SYSTEM',
    items: [
      {
        label: 'SMS Communications',
        href: '/sms/send',
        icon: 'fa-solid fa-paper-plane',
        submenu: [
          { label: 'Send Single SMS', href: '/sms/send' },
          { label: 'Send Bulk SMS', href: '/sms/bulk' },
          { label: 'SMS Log History', href: '/sms/history' },
        ],
      },
      {
        label: 'Settings',
        href: '/settings',
        icon: 'fa-solid fa-sliders',
        submenu: [
          { label: 'General Settings', href: '/settings' },
          { label: 'Branch Setup', href: '/settings/branches' },
          { label: 'Manage Users', href: '/settings/users' },
          { label: 'Menu Privilege List', href: '/settings/privileges' },
          { label: 'Add Menu Item', href: '/settings/menus/add' },
        ],
      },
      { label: 'Financial Reports', href: '/reports', icon: 'fa-solid fa-file-invoice' },
    ],
  },
];

// Module-level storage persists across client-side page transitions in Next.js
let globalSidebarScroll = 0;
let globalOpenMenus: Record<string, boolean> = {
  Accounts: true,
  Members: true,
  Savings: true,
  Loans: true,
  'HR & Attendance': true,
  'SMS Communications': false,
  Settings: false,
};

// Hydrate from sessionStorage if available
if (typeof window !== 'undefined') {
  try {
    const savedScroll = sessionStorage.getItem('somity_sidebar_scroll');
    if (savedScroll) globalSidebarScroll = Number(savedScroll);
    const savedMenus = sessionStorage.getItem('somity_sidebar_menus');
    if (savedMenus) globalOpenMenus = { ...globalOpenMenus, ...JSON.parse(savedMenus) };
  } catch {}
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function getInitialOpenMenus(currentPath: string): Record<string, boolean> {
  const menus = { ...globalOpenMenus };
  for (const group of ALL_NAV_GROUPS) {
    for (const item of group.items) {
      if (item.submenu?.some(s => s.href === currentPath || (s.href !== '/' && currentPath.startsWith(s.href)))) {
        menus[item.label] = true;
      }
    }
  }
  return menus;
}

function filterNavGroups(role: UserRole) {
  const visibleItems = getVisibleNavItems(role);
  const visibleSubs = getVisibleSubItems(role);

  return ALL_NAV_GROUPS
    .map(group => ({
      ...group,
      items: group.items
        .filter(item => visibleItems.includes(item.label))
        .map(item => ({
          ...item,
          submenu: item.submenu?.filter(sub => {
            const allowed = visibleSubs[item.label];
            return !allowed || allowed.includes(sub.label);
          }),
        })),
    }))
    .filter(group => group.items.length > 0);
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export const Sidebar: React.FC<{ isOpen: boolean; toggleSidebar: () => void }> = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname();
  const { user, logout, authorizedMenus } = useAuth();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => getInitialOpenMenus(pathname));

  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);

  // Use dynamic authorized menus from server if loaded; fallback to static role filter
  const navGroups = (authorizedMenus && authorizedMenus.length > 0)
    ? authorizedMenus
    : (user ? filterNavGroups(user.role) : []);

  // Automatically keep parent menu open if active path is in its submenu
  useEffect(() => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.submenu?.some(s => s.href === pathname || (s.href !== '/' && pathname.startsWith(s.href)))) {
          setOpenMenus(prev => {
            if (prev[item.label]) return prev;
            const next = { ...prev, [item.label]: true };
            globalOpenMenus = next;
            try { sessionStorage.setItem('somity_sidebar_menus', JSON.stringify(next)); } catch {}
            return next;
          });
        }
      }
    }
  }, [pathname, navGroups]);

  // Callback ref to restore scroll immediately on DOM attachment (prevents visual jump)
  const setNavContainerRef = useCallback((node: HTMLDivElement | null) => {
    navContainerRef.current = node;
    if (node && globalSidebarScroll > 0) {
      node.scrollTop = globalSidebarScroll;
    }
  }, []);

  // Synchronous layout effect to restore or adjust scroll position
  useIsomorphicLayoutEffect(() => {
    if (navContainerRef.current) {
      if (globalSidebarScroll > 0) {
        navContainerRef.current.scrollTop = globalSidebarScroll;
      } else if (activeLinkRef.current) {
        activeLinkRef.current.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      }
    }
  }, [pathname]);

  // Additional microtask check to ensure scroll stays put after submenus render
  useEffect(() => {
    const timer = setTimeout(() => {
      if (navContainerRef.current && globalSidebarScroll > 0) {
        navContainerRef.current.scrollTop = globalSidebarScroll;
      }
    }, 40);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    globalSidebarScroll = top;
    try {
      sessionStorage.setItem('somity_sidebar_scroll', String(top));
    } catch {}
  };

  const handleNavClick = () => {
    if (navContainerRef.current) {
      const top = navContainerRef.current.scrollTop;
      globalSidebarScroll = top;
      try {
        sessionStorage.setItem('somity_sidebar_scroll', String(top));
      } catch {}
    }
  };

  const toggleMenu = (key: string) => {
    setOpenMenus(prev => {
      const next = { ...prev, [key]: !prev[key] };
      globalOpenMenus = next;
      try { sessionStorage.setItem('somity_sidebar_menus', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const roleIcon = user ? ROLE_ICONS[user.role] : 'fa-user';
  const roleColor = user ? ROLE_COLORS[user.role] : '';

  return (
    <aside className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-900 text-slate-300 w-[270px] flex flex-col border-r border-slate-800 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
        <Link href="/dashboard" onClick={handleNavClick} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-building-columns text-sm"></i>
          </div>
          <div>
            <span className="font-extrabold text-white text-base tracking-tight block leading-none">Somity ERP</span>
            <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">Co-operative Online</span>
          </div>
        </Link>
        <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-white transition-colors">
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      {/* User Role Badge */}
      {user && (
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${roleColor}`}>
            <i className={`fa-solid ${roleIcon} text-[9px]`}></i>
            {user.role}
          </div>
          {user.role === 'Teller' && (
            <p className="text-[10px] text-slate-500 mt-1">
              <i className="fa-solid fa-coins text-slate-600 mr-1"></i>
              Txn Limit: <span className="text-slate-400 font-semibold">৳{user.transactionLimit.toLocaleString()}</span>
            </p>
          )}
        </div>
      )}

      {/* Navigation List */}
      <div
        ref={setNavContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin"
      >
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{group.title}</h4>
            {group.items.map((item, itemIdx) => {
              const hasSubmenu = Boolean(item.submenu && item.submenu.length > 0);
              const isOpenMenu = Boolean(openMenus[item.label]);
              const isActive = pathname === item.href || item.submenu?.some(s => s.href === pathname);

              return (
                <div key={itemIdx}>
                  {hasSubmenu ? (
                    <div>
                      <button
                        onClick={() => toggleMenu(item.label)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <i className={`${item.icon} w-4 text-center text-slate-400`}></i>
                          <span>{item.label}</span>
                        </div>
                        <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${isOpenMenu ? 'rotate-180' : ''}`}></i>
                      </button>
                      {isOpenMenu && (
                        <div className="ml-7 mt-1 pl-2 border-l border-slate-800 space-y-1">
                          {item.submenu?.map((sub, subIdx) => {
                            const isSubActive = pathname === sub.href;
                            return (
                              <Link
                                key={subIdx}
                                href={sub.href}
                                ref={isSubActive ? activeLinkRef : undefined}
                                onClick={handleNavClick}
                                className={`block px-3 py-1.5 rounded text-xs transition-colors ${isSubActive ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
                              >
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      ref={isActive ? activeLinkRef : undefined}
                      onClick={handleNavClick}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'}`}
                    >
                      <i className={`${item.icon} w-4 text-center text-slate-400`}></i>
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Profile Panel */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow flex-shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.branch}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
            >
              <i className="fa-solid fa-right-from-bracket text-xs"></i>Sign Out
            </button>
          </div>
        ) : (
          <div className="h-12 bg-slate-800/50 rounded-lg animate-pulse"></div>
        )}
      </div>
    </aside>
  );
};
