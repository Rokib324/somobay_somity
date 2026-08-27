'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function ShiftManagementPage() {
  const shifts = [
    { title: 'Morning Shift', start: '09:00 AM', end: '05:00 PM', grace: '15 Mins', activeStaff: 12 },
    { title: 'Evening Shift', start: '02:00 PM', end: '10:00 PM', grace: '15 Mins', activeStaff: 4 },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Work Shift Management"
        subtitle="Configure daily office working hours, grace period limits, and employee shift schedules."
        breadcrumbs={[{ label: 'HR', href: '/hr/employees' }, { label: 'Shifts' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {shifts.map((s, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 card-shadow space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{s.activeStaff} Assigned Staff</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
            <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div>Timing: <span className="font-semibold text-slate-800">{s.start} — {s.end}</span></div>
              <div>Grace Limit: <span className="font-semibold text-slate-800">{s.grace}</span></div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
