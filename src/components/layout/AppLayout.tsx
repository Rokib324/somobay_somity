'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-[270px]' : 'ml-0'}`}>
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
        <footer className="py-4 px-8 border-t border-slate-200 bg-white text-xs text-slate-500 text-center flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Somity Online ERP — Co-Operative Management System</span>
          <span className="text-slate-400">Version 2.5 (Next.js Enterprise Edition)</span>
        </footer>
      </div>
    </div>
  );
};
