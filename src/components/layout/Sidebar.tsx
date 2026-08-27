'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  submenu?: { label: string; href: string }[];
}

export const Sidebar: React.FC<{ isOpen: boolean; toggleSidebar: () => void }> = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Accounts: true,
    Members: true,
    Savings: true,
    Loans: true,
  });

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navGroups: { title: string; items: NavItem[] }[] = [
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
            { label: 'Loan Accounts', href: '/loans' },
            { label: 'Loan Disbursement', href: '/loans/disbursement' },
            { label: 'Loan Products', href: '/loans/products' },
            { label: 'Loan Approvals', href: '/loans/approvals' },
            { label: 'Repayment Schedules', href: '/loans/schedules' },
            { label: 'Loan Closing', href: '/loans/closing' },
            { label: 'Interest Setup', href: '/loans/interest-setup' },
            { label: 'Due Collections', href: '/collections/due' },
            { label: 'Daily Collection', href: '/collections/daily' },
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

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-900 text-slate-300 w-[270px] flex flex-col border-r border-slate-800 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
            S
          </div>
          <div>
            <span className="font-extrabold text-white text-base tracking-tight block leading-none">Somity ERP</span>
            <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">Co-operative Online</span>
          </div>
        </Link>
        <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-white">
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{group.title}</h4>
            {group.items.map((item, itemIdx) => {
              const hasSubmenu = Boolean(item.submenu && item.submenu.length > 0);
              const isOpenMenu = Boolean(openMenus[item.label]);
              const isActive = pathname === item.href || item.submenu?.some((s) => s.href === pathname);

              return (
                <div key={itemIdx}>
                  {hasSubmenu ? (
                    <div>
                      <button
                        onClick={() => toggleMenu(item.label)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`}
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
                                className={`block px-3 py-1.5 rounded text-xs transition-colors ${
                                  isSubActive ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                }`}
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
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
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

      {/* Footer Profile Snippet */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Super Admin</p>
            <p className="text-[10px] text-slate-400 truncate">Main Branch (Dhaka)</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
