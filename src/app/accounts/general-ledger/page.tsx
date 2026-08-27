'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function GeneralLedgerPage() {
  const ledgerEntries = [
    { date: '2026-08-01', voucher: 'JV-801', head: 'Cash in Hand (1010)', nar: 'Opening Balance brought forward', debit: 450000, credit: 0, balance: 450000 },
    { date: '2026-08-05', voucher: 'CR-802', head: 'Daily Savings Collection', nar: 'Member daily deposit collection sheet #12', debit: 85000, credit: 0, balance: 535000 },
    { date: '2026-08-10', voucher: 'DV-803', head: 'Loan Disbursement - LN-201', nar: 'Micro enterprise loan disbursement to Nasrin Akhter', debit: 0, credit: 100000, balance: 435000 },
    { date: '2026-08-15', voucher: 'PV-804', head: 'Staff Salary Expense', nar: 'August partial salary payment', debit: 0, credit: 45000, balance: 390000 },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="General Ledger Book"
        subtitle="Complete chronological statement of debit and credit entries across all accounts."
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'General Ledger' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6">
        {/* Date Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Account Head</label>
            <select className="w-full p-2 bg-white border border-slate-200 rounded-lg">
              <option>1010 - Cash in Hand</option>
              <option>1020 - Cash at Bank</option>
              <option>2010 - General Savings Deposit</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">From Date</label>
            <input type="date" defaultValue="2026-08-01" className="w-full p-2 bg-white border border-slate-200 rounded-lg" />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">To Date</label>
            <input type="date" defaultValue="2026-08-23" className="w-full p-2 bg-white border border-slate-200 rounded-lg" />
          </div>
          <div className="flex items-end">
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg">
              Generate Ledger
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Narration</th>
                <th className="py-3 px-4 text-right">Debit (৳)</th>
                <th className="py-3 px-4 text-right">Credit (৳)</th>
                <th className="py-3 px-4 text-right">Running Balance (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledgerEntries.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500 font-medium">{row.date}</td>
                  <td className="py-3 px-4 font-bold text-blue-600">{row.voucher}</td>
                  <td className="py-3 px-4 text-slate-700">{row.nar}</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-600">{row.debit ? `৳ ${row.debit.toLocaleString()}` : '—'}</td>
                  <td className="py-3 px-4 text-right font-semibold text-rose-600">{row.credit ? `৳ ${row.credit.toLocaleString()}` : '—'}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">৳ {row.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
