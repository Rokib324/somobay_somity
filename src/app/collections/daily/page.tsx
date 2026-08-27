'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function DailyCollectionSheetPage() {
  const membersSheet = [
    { acNo: 'AC-1001', name: 'Md. Al-Amin Khan', targetSavings: 500, targetLoan: 0, collectedSavings: 500, collectedLoan: 0 },
    { acNo: 'AC-1002', name: 'Nasrin Akhter', targetSavings: 200, targetLoan: 5000, collectedSavings: 200, collectedLoan: 5000 },
    { acNo: 'AC-1004', name: 'Sharmin Sultana', targetSavings: 1000, targetLoan: 15000, collectedSavings: 1000, collectedLoan: 15000 },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Daily Field Collection Sheet"
        subtitle="Batch entry for field officers during daily / weekly collection rounds."
        breadcrumbs={[{ label: 'Collections', href: '/collections' }, { label: 'Daily Field Sheet' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Center #04 — Mirpur Field Collection</h3>
            <p className="text-xs text-slate-400">Assigned Officer: Mahmuda Begum</p>
          </div>
          <button className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm">
            Batch Save Sheet & Post
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Account No</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4 text-right">Savings Collection (৳)</th>
                <th className="py-3 px-4 text-right">Loan Collection (৳)</th>
                <th className="py-3 px-4 text-right">Total (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {membersSheet.map((m) => (
                <tr key={m.acNo} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-blue-600">{m.acNo}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{m.name}</td>
                  <td className="py-3 px-4 text-right">
                    <input type="number" defaultValue={m.collectedSavings} className="w-28 p-1.5 border border-slate-200 rounded text-right font-bold text-emerald-600" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <input type="number" defaultValue={m.collectedLoan} className="w-28 p-1.5 border border-slate-200 rounded text-right font-bold text-blue-600" />
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    ৳ {(m.collectedSavings + m.collectedLoan).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
