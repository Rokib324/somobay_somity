'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function ProfitLossPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Profit & Loss Statement (P&L)"
        subtitle="Summary of revenues, costs, and expenses incurred during the operating period."
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Profit & Loss' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Revenue Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-emerald-100 bg-emerald-50/50 -mx-6 -mt-6 p-6 rounded-t-xl">
            <h3 className="font-bold text-emerald-800 text-sm flex items-center gap-2">
              <i className="fa-solid fa-circle-arrow-down text-emerald-600"></i>
              Operating Revenue & Income
            </h3>
            <span className="font-extrabold text-emerald-700 text-base">৳ 38,50,000</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Loan Service Interest Income</span>
              <span className="font-bold text-slate-900">৳ 28,50,000</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Member Admission & Book Fees</span>
              <span className="font-bold text-slate-900">৳ 4,20,000</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Investment Dividend Income</span>
              <span className="font-bold text-slate-900">৳ 5,80,000</span>
            </div>
          </div>
        </div>

        {/* Expenses Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-rose-100 bg-rose-50/50 -mx-6 -mt-6 p-6 rounded-t-xl">
            <h3 className="font-bold text-rose-800 text-sm flex items-center gap-2">
              <i className="fa-solid fa-circle-arrow-up text-rose-600"></i>
              Operating & Administrative Expenses
            </h3>
            <span className="font-extrabold text-rose-700 text-base">৳ 21,50,000</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Staff Salary & Allowances</span>
              <span className="font-bold text-slate-900">৳ 14,20,000</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Office Rent & Utilities</span>
              <span className="font-bold text-slate-900">৳ 4,50,000</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Printing, Stationary & Software</span>
              <span className="font-bold text-slate-900">৳ 2,80,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Operating Profit Banner */}
      <div className="mt-6 p-6 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-xl">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">Net Operating Profit</span>
          <h2 className="text-2xl font-black mt-1">৳ 17,00,000</h2>
        </div>
        <div className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold">
          +44.1% Net Profit Margin
        </div>
      </div>
    </AppLayout>
  );
}
