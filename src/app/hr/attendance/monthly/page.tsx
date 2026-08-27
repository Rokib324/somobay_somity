'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function MonthlyAttendanceReportPage() {
  const staff = [
    { empId: 'E-101', name: 'Tariqul Islam', present: 22, late: 1, leave: 1, absent: 0, totalWorkDays: 24 },
    { empId: 'E-102', name: 'Mahmuda Begum', present: 20, late: 3, leave: 1, absent: 0, totalWorkDays: 24 },
    { empId: 'E-103', name: 'Farhana Yeasmin', present: 24, late: 0, leave: 0, absent: 0, totalWorkDays: 24 },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Monthly Attendance Summary Matrix"
        subtitle="Cumulative monthly attendance, leave counts, and late arrival records for payroll computation."
        breadcrumbs={[{ label: 'HR', href: '/hr/employees' }, { label: 'Attendance', href: '/hr/attendance' }, { label: 'Monthly Report' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Emp ID</th>
                <th className="py-3 px-4">Staff Name</th>
                <th className="py-3 px-4 text-center">Work Days</th>
                <th className="py-3 px-4 text-center">Present</th>
                <th className="py-3 px-4 text-center">Late</th>
                <th className="py-3 px-4 text-center">Approved Leave</th>
                <th className="py-3 px-4 text-center">Absent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((s) => (
                <tr key={s.empId} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{s.empId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">{s.totalWorkDays}</td>
                  <td className="py-3 px-4 text-center font-extrabold text-emerald-600">{s.present}</td>
                  <td className="py-3 px-4 text-center font-bold text-amber-600">{s.late}</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-600">{s.leave}</td>
                  <td className="py-3 px-4 text-center font-bold text-rose-600">{s.absent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
