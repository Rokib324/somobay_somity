'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function ApplyWithdrawalPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Apply for Savings Withdrawal"
        subtitle="Submit a formal withdrawal requisition for cash or bank payout."
        breadcrumbs={[{ label: 'Savings', href: '/savings/deposits' }, { label: 'Withdrawals', href: '/savings/withdrawals' }, { label: 'Apply' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-2xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); alert('Withdrawal Application Submitted for Approval'); }} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Account</label>
            <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold">
              <option>AC-1001 — Md. Al-Amin Khan (Balance: ৳ 1,45,000)</option>
              <option>AC-1003 — Habibur Rahman (Balance: ৳ 2,30,000)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Withdrawal Amount (৳)</label>
            <input type="number" placeholder="Enter amount to withdraw" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-lg font-black text-rose-600" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
            <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <option>Cash from Counter</option>
              <option>Bank Account Transfer (BEFTN)</option>
              <option>Cheque Disbursement</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Withdrawal</label>
            <textarea rows={2} placeholder="Brief details for records..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"></textarea>
          </div>

          <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-lg shadow-md transition-colors">
            Submit Requisition for Approval
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
