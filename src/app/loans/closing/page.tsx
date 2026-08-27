'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function LoanClosingPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Loan Settlement & Closing"
        subtitle="Process early loan closing or final maturity settlements with clearance certificates."
        breadcrumbs={[{ label: 'Loans', href: '/loans' }, { label: 'Loan Closing' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-2xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); alert('Loan Settled & Account Closed!'); }} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Active Loan Account</label>
            <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold">
              <option>LN-1002-A — Nasrin Akhter (Outstanding Due: ৳ 75,000)</option>
              <option>LN-1004-B — Sharmin Sultana (Outstanding Due: ৳ 2,00,000)</option>
            </select>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
            <span className="font-bold text-amber-800 text-xs">Settlement Calculation Summary</span>
            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-amber-200">
              <span>Final Settlement Amount:</span>
              <span className="text-emerald-700 text-base">৳ 75,000</span>
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-md">
            Issue Clearance & Close Loan Ledger
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
