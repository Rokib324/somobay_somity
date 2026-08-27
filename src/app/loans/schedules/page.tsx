'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function LoanSchedulesPage() {
  const schedule = [
    { instNo: 1, dueDate: '2026-02-05', principal: 4166, interest: 834, total: 5000, status: 'Paid' },
    { instNo: 2, dueDate: '2026-03-05', principal: 4166, interest: 834, total: 5000, status: 'Paid' },
    { instNo: 3, dueDate: '2026-04-05', principal: 4166, interest: 834, total: 5000, status: 'Paid' },
    { instNo: 4, dueDate: '2026-05-05', principal: 4166, interest: 834, total: 5000, status: 'Due' },
    { instNo: 5, dueDate: '2026-06-05', principal: 4166, interest: 834, total: 5000, status: 'Upcoming' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Loan Repayment Schedule Matrix"
        subtitle="Installment repayment schedule for Loan LN-1002-A (Nasrin Akhter)."
        breadcrumbs={[{ label: 'Loans', href: '/loans' }, { label: 'Repayment Schedule' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Installment #</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Principal (৳)</th>
                <th className="py-3 px-4 text-right">Interest (৳)</th>
                <th className="py-3 px-4 text-right">Total Installment (৳)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedule.map((s) => (
                <tr key={s.instNo} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-700"># {s.instNo}</td>
                  <td className="py-3 px-4 text-slate-500">{s.dueDate}</td>
                  <td className="py-3 px-4 text-right font-medium">৳ {s.principal.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-medium">৳ {s.interest.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">৳ {s.total.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${s.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : s.status === 'Due' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                      {s.status}
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
