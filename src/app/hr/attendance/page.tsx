'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { mockAttendance } from '@/data/mockData';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function DailyAttendancePage() {
  return (
    <AppLayout>
      <PageHeader
        title="Daily Staff Attendance Log"
        subtitle="Real-time employee check-in times, late arrivals, and departure logs."
        breadcrumbs={[{ label: 'HR', href: '/hr/employees' }, { label: 'Attendance' }]}
        action={
          <Link href="/hr/attendance/monthly" className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm">
            Monthly Summary Report
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Emp ID</th>
                <th className="py-3 px-4">Staff Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockAttendance.map((att) => (
                <tr key={att.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{att.empId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{att.empName}</td>
                  <td className="py-3 px-4 text-slate-500">{att.date}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">{att.checkIn}</td>
                  <td className="py-3 px-4 font-bold text-slate-700">{att.checkOut}</td>
                  <td className="py-3 px-4">
                    <Badge variant={att.status === 'Present' ? 'success' : att.status === 'Late' ? 'warning' : 'danger'}>
                      {att.status}
                    </Badge>
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
