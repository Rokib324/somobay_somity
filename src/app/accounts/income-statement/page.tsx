'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function IncomeStatementPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Income Statement"
        subtitle="Financial performance statement detailing revenues, interest income, operating expenses, and net surplus."
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Income Statement' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-8 card-shadow space-y-6 max-w-4xl mx-auto">
        <div className="text-center pb-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900">SOMITY ONLINE CO-OPERATIVE SOCIETY</h2>
          <h3 className="text-sm font-bold text-slate-700 mt-1">STATEMENT OF COMPREHENSIVE INCOME</h3>
          <p className="text-xs text-slate-400 mt-1">For the period ended August 23, 2026</p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="font-bold text-slate-800 text-sm uppercase tracking-wide text-blue-600">1. Revenue & Operating Income</div>
          <div className="pl-4 space-y-2">
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span>Interest on Service Loans</span>
              <span className="font-semibold">৳ 28,50,000</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span>Admission & Document Charges</span>
              <span className="font-semibold">৳ 4,20,000</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1 font-bold text-slate-900 pt-1">
              <span>Total Revenue (A)</span>
              <span>৳ 32,70,000</span>
            </div>
          </div>

          <div className="font-bold text-slate-800 text-sm uppercase tracking-wide text-rose-600 pt-4">2. Operating Expenses</div>
          <div className="pl-4 space-y-2">
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span>Staff Salaries & Compensation</span>
              <span className="font-semibold">৳ 14,20,000</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span>Office Rent & Utilities</span>
              <span className="font-semibold">৳ 4,50,000</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1 font-bold text-slate-900 pt-1">
              <span>Total Expenses (B)</span>
              <span>৳ 18,70,000</span>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-slate-900 flex justify-between items-center text-sm font-black text-slate-900">
            <span>NET OPERATING SURPLUS (A - B)</span>
            <span className="text-emerald-600 text-base">৳ 14,00,000</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
