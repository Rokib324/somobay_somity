'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function TrialBalancePage() {
  const trialRows = [
    { code: '1010', name: 'Cash in Hand', debit: 450000, credit: 0 },
    { code: '1020', name: 'Cash at Bank (Sonali Bank)', debit: 12550000, credit: 0 },
    { code: '2010', name: 'General Savings Deposit', debit: 0, credit: 9400000 },
    { code: '3000', name: 'Share Capital', debit: 0, credit: 5000000 },
    { code: '4000', name: 'Loan Interest Income', debit: 0, credit: 2850000 },
    { code: '5000', name: 'Staff Salary & Allowance', debit: 1420000, credit: 0 },
    { code: '5010', name: 'Office Rent & Utilities', debit: 280000, credit: 0 },
    { code: '2020', name: 'Fixed Deposit (FDR) Liabilities', debit: 0, credit: 2450000 },
  ];

  const totalDebit = trialRows.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = trialRows.reduce((sum, r) => sum + r.credit, 0);

  return (
    <AppLayout>
      <PageHeader
        title="Trial Balance Statement"
        subtitle="Verification of equal debit and credit balances for all chart of account ledger heads."
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Trial Balance' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">As of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
            <p className="text-xs text-slate-400">All Branches Combined</p>
          </div>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg flex items-center gap-2">
            <i className="fa-solid fa-print"></i>
            Print Statement
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3.5 px-4">Account Code</th>
                <th className="py-3.5 px-4">Account Head Name</th>
                <th className="py-3.5 px-4 text-right">Debit Balance (৳)</th>
                <th className="py-3.5 px-4 text-right">Credit Balance (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trialRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{row.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{row.name}</td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-600">{row.debit ? `৳ ${row.debit.toLocaleString()}` : '—'}</td>
                  <td className="py-3 px-4 text-right font-medium text-rose-600">{row.credit ? `৳ ${row.credit.toLocaleString()}` : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white font-extrabold text-xs">
                <td colSpan={2} className="py-3.5 px-4 uppercase tracking-wider">Total Balanced Amount</td>
                <td className="py-3.5 px-4 text-right text-emerald-400">৳ {totalDebit.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right text-rose-400">৳ {totalCredit.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
