'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function DutyRosterPage() {
  const roster = [
    { day: 'Sunday', officer: 'Mahmuda Begum', zone: 'Mirpur Center #04', task: 'Daily Collection' },
    { day: 'Monday', officer: 'Tariqul Islam', zone: 'Motijheel Head Office', task: 'Ledger Audit' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Weekly Duty Roster"
        subtitle="Assign weekly field collection routes, branch duties, and officer schedules."
        breadcrumbs={[{ label: 'HR', href: '/hr/employees' }, { label: 'Duty Roster' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Assigned Officer</th>
                <th className="py-3 px-4">Zone / Branch</th>
                <th className="py-3 px-4">Assigned Task</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roster.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{r.day}</td>
                  <td className="py-3.5 px-4 font-semibold text-blue-600">{r.officer}</td>
                  <td className="py-3.5 px-4 text-slate-600">{r.zone}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{r.task}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
