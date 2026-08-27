'use client';

import React from 'react';
import Link from 'next/link';

export const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
        >
          <i className="fa-solid fa-bars text-lg"></i>
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden sm:block w-64 md:w-80">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search accounts, members, vouchers..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Branch Selector */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700">
          <i className="fa-solid fa-code-branch text-blue-600"></i>
          <select className="bg-transparent focus:outline-none font-semibold text-slate-800 cursor-pointer">
            <option>Main Branch (Dhaka)</option>
            <option>Uttara Branch</option>
            <option>Gulshan Branch</option>
          </select>
        </div>

        {/* Quick Action Button */}
        <Link
          href="/savings/create"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors"
        >
          <i className="fa-solid fa-user-plus text-xs"></i>
          New Member
        </Link>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
          <i className="fa-regular fa-bell text-base"></i>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        {/* User Dropdown Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
            SA
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">System Admin</p>
            <p className="text-[10px] text-slate-400 font-medium">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};
