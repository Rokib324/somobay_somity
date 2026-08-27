'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('Main Branch (Dhaka)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden p-4">
      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none"></div>
      <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none"></div>

      {/* Login Container Box */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/30">
            S
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Co-Operative ERP</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Somity Online Financial Management System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Branch
            </label>
            <div className="relative">
              <i className="fa-solid fa-code-branch absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                <option>Main Branch (Dhaka)</option>
                <option>Uttara Branch</option>
                <option>Gulshan Branch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Username / ID
            </label>
            <div className="relative">
              <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                type="text"
                required
                placeholder="Enter user ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <a href="#" className="text-[11px] font-semibold text-blue-600 hover:underline">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-6"
          >
            <span>Sign In to ERP Portal</span>
            <i className="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          Need technical help? Contact <span className="font-semibold text-slate-600">Somity Support</span>
        </div>
      </div>
    </div>
  );
}
