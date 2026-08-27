'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function LoanDisbursementPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Loan Disbursement Entry"
        subtitle="Process approved loan payouts to member bank accounts or counter cash."
        breadcrumbs={[{ label: 'Loans', href: '/loans' }, { label: 'Disbursement' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-3xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); alert('Loan Disbursed & Voucher Posted Successfully!'); }} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Borrower Member</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <option>AC-1002 — Nasrin Akhter</option>
                <option>AC-1004 — Sharmin Sultana</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Loan Scheme</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <option>Small Business Micro Loan (12%)</option>
                <option>Enterprise Growth Loan (14%)</option>
                <option>Emergency Member Loan (10%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sanction Amount (৳)</label>
              <input type="number" defaultValue={100000} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Installment Count</label>
              <input type="number" defaultValue={24} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Disbursement Date</label>
              <input type="date" defaultValue="2026-08-23" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-md transition-colors">
            Disburse Loan Funds & Generate Schedule
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
