'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function DueCollectionPage() {
  const overdueMembers = [
    { acNo: 'AC-1002', name: 'Nasrin Akhter', overdueDays: 14, dueAmount: 10000, lastPayDate: '2026-08-05' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Overdue Loan Recovery List"
        subtitle="Track defaulting loan accounts and overdue installment recovery progress."
        breadcrumbs={[{ label: 'Collections', href: '/collections' }, { label: 'Overdue List' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Account No</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Overdue Days</th>
                <th className="py-3 px-4 text-right">Due Amount (৳)</th>
                <th className="py-3 px-4">Last Payment Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overdueMembers.map((m) => (
                <tr key={m.acNo} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-rose-600">{m.acNo}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{m.name}</td>
                  <td className="py-3 px-4 font-bold text-rose-600">{m.overdueDays} Days</td>
                  <td className="py-3 px-4 text-right font-black text-rose-700">৳ {m.dueAmount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-500">{m.lastPayDate}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="px-3 py-1 bg-blue-600 text-white font-bold rounded text-xs hover:bg-blue-700">Send Warning SMS</button>
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
