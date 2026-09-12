'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Client-side safety net — proxy.ts already handles this server-side
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?reason=unauthenticated');
    }
  }, [isLoading, user, router]);

  // Show loading spinner while auth resolves
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Loading Somity ERP...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content while redirecting
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-[270px]' : 'ml-0'}`}>
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
        <footer className="py-4 px-8 border-t border-slate-200 bg-white text-xs text-slate-500 text-center flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Somity Online ERP — Co-Operative Management System</span>
          <span className="text-slate-400">Version 2.5 | Logged in as: <strong className="text-slate-600">{user.name}</strong> ({user.role})</span>
        </footer>
      </div>
    </div>
  );
};
