'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_ICONS, ROLE_COLORS } from '@/lib/auth-shared';
import type { UserRole } from '@/models/User';

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const roleIcon = user ? ROLE_ICONS[user.role as UserRole] : 'fa-user';
  const roleColor = user ? ROLE_COLORS[user.role as UserRole] : '';

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors md:hidden">
          <i className="fa-solid fa-bars text-lg"></i>
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden sm:block w-64 md:w-80">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input type="text" placeholder="Search accounts, members, vouchers..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Branch indicator */}
        {user && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700">
            <i className="fa-solid fa-code-branch text-blue-600"></i>
            <span className="font-semibold text-slate-800">{user.branch}</span>
          </div>
        )}

        {/* Quick Action */}
        <Link href="/savings/create"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors">
          <i className="fa-solid fa-user-plus text-xs"></i>New Member
        </Link>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
          <i className="fa-regular fa-bell text-base"></i>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative pl-3 border-l border-slate-200">
          <button onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md flex-shrink-0">
              {user ? getInitials(user.name) : '?'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name ?? 'Loading...'}</p>
              {user && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${roleColor}`}>
                  <i className={`fa-solid ${roleIcon} text-[9px]`}></i>
                  {user.role}
                </span>
              )}
            </div>
            <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''} hidden md:block`}></i>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-20 overflow-hidden">
                {/* User info header */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow">
                      {user ? getInitials(user.name) : '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </div>
                  {user && (
                    <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${roleColor}`}>
                      <i className={`fa-solid ${roleIcon} text-[9px]`}></i>
                      {user.role}
                    </div>
                  )}
                </div>

                {/* Menu items */}
                <div className="p-2">
                  <Link href="/settings" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <i className="fa-solid fa-sliders w-4 text-center text-slate-400"></i>
                    Settings
                  </Link>
                  <button onClick={() => { setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left">
                    <i className="fa-solid fa-key w-4 text-center text-slate-400"></i>
                    Change Password
                  </button>
                  <Link href="/reports" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <i className="fa-solid fa-file-invoice w-4 text-center text-slate-400"></i>
                    My Reports
                  </Link>
                </div>

                <div className="p-2 border-t border-slate-100">
                  <button onClick={handleLogout} disabled={loggingOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60">
                    {loggingOut
                      ? <><span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></span>Signing out...</>
                      : <><i className="fa-solid fa-right-from-bracket w-4 text-center"></i>Sign Out</>}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
