'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function SubLedgerReportPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Sub-Ledger Detailed Report"
        subtitle="Breakdown of individual member savings, vendor payables, and loan sub-ledgers under primary account heads."
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Sub-Ledger Report' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Main Account Head</label>
            <select className="w-full p-2 bg-white border border-slate-200 rounded-lg">
              <option>2010 - General Savings Deposit</option>
              <option>1050 - Loans Receivable</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Sub-Ledger Type</label>
            <select className="w-full p-2 bg-white border border-slate-200 rounded-lg">
              <option>Member Account Sub-Ledger</option>
              <option>Staff Salary Sub-Ledger</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg">
              Filter Sub-Ledgers
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Sub-Ledger Code</th>
                <th className="py-3 px-4">Entity / Member Name</th>
                <th className="py-3 px-4">Parent Account Head</th>
                <th className="py-3 px-4 text-right">Balance (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-blue-600">SL-1001</td>
                <td className="py-3 px-4 font-semibold text-slate-800">Md. Al-Amin Khan (AC-1001)</td>
                <td className="py-3 px-4 text-slate-500">2010 - General Savings Deposit</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">৳ 1,45,000</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-blue-600">SL-1002</td>
                <td className="py-3 px-4 font-semibold text-slate-800">Nasrin Akhter (AC-1002)</td>
                <td className="py-3 px-4 text-slate-500">2010 - General Savings Deposit</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">৳ 89,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
