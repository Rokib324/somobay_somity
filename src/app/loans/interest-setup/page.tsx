'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function InterestSetupPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Interest Calculation Engine Setup"
        subtitle="Configure interest rate computation formulas (Flat, Diminishing Balance, Amortized)."
        breadcrumbs={[{ label: 'Loans', href: '/loans' }, { label: 'Interest Setup' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-2xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); alert('Interest Formula Rules Updated'); }} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Interest Calculation Method</label>
            <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <option>Flat Interest Rate</option>
              <option>Reducing / Diminishing Balance Method</option>
              <option>Equal Monthly Installment (EMI) Formula</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Grace Period (Days)</label>
            <input type="number" defaultValue={7} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Late Payment Penalty (%)</label>
            <input type="number" defaultValue={2.0} step="0.5" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold" />
          </div>

          <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg">
            Save Interest Engine Parameters
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
