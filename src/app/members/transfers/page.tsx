'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function MemberTransfersPage() {
  const transfers = [
    { date: '2026-08-10', member: 'Md. Al-Amin Khan (AC-1001)', from: 'Uttara Branch', to: 'Main Branch (Dhaka)', reason: 'Residence relocation', status: 'Completed' },
    { date: '2026-08-18', member: 'Kamrul Hasan (AC-1005)', from: 'Gulshan Branch', to: 'Uttara Branch', reason: 'Business center move', status: 'Pending Approval' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Member Branch Transfers"
        subtitle="Transfer member accounts, deposit ledgers, and loan balances between cooperative branches."
        breadcrumbs={[{ label: 'Members', href: '/members' }, { label: 'Transfers' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">Recent Branch Transfer Applications</h3>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg">
            + New Transfer Request
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Member Name & AC</th>
                <th className="py-3.5 px-4">From Branch</th>
                <th className="py-3.5 px-4">To Branch</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500 font-medium">{t.date}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{t.member}</td>
                  <td className="py-3 px-4 text-rose-700 font-medium">{t.from}</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">{t.to}</td>
                  <td className="py-3 px-4 text-slate-600">{t.reason}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${t.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {t.status}
                    </span>
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
