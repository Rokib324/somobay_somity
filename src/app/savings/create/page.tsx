'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function CreateSavingsAccountPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Open New Savings Scheme Account"
        subtitle="Configure new DPS, FDR, or Daily Savings account for registered members."
        breadcrumbs={[{ label: 'Savings', href: '/savings/deposits' }, { label: 'New Account' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-3xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); alert('Savings Account Opened Successfully!'); }} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Member</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <option>AC-1001 — Md. Al-Amin Khan</option>
                <option>AC-1002 — Nasrin Akhter</option>
                <option>AC-1003 — Habibur Rahman</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Savings Scheme Type</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <option>Daily Savings Account (7.5%)</option>
                <option>Monthly DPS Scheme (9.0%)</option>
                <option>Fixed Deposit FDR (11.5%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Installment Amount (৳)</label>
              <input type="number" placeholder="e.g. 2000" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Term (Months)</label>
              <input type="number" placeholder="e.g. 36" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Interest Rate (%)</label>
              <input type="number" defaultValue={9.0} step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg">
              Create Savings Account
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
