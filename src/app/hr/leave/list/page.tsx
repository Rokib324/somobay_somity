'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function LeaveApplicationsListPage() {
  const applications = [
    { id: 'LV-401', staff: 'Tariqul Islam (E-101)', type: 'Casual Leave', from: '2026-08-15', to: '2026-08-16', days: 2, status: 'Approved' },
    { id: 'LV-402', staff: 'Mahmuda Begum (E-102)', type: 'Sick Leave', from: '2026-08-25', to: '2026-08-26', days: 2, status: 'Pending' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Staff Leave Applications"
        subtitle="Review casual, sick, and annual leave applications for employees."
        breadcrumbs={[{ label: 'HR', href: '/hr/employees' }, { label: 'Leave' }]}
        action={
          <Link href="/hr/leave/apply" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm">
            + Apply for Leave
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Leave Category</th>
                <th className="py-3 px-4">Date Range</th>
                <th className="py-3 px-4 text-center">Days</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-blue-600">{a.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{a.staff}</td>
                  <td className="py-3.5 px-4 text-slate-600">{a.type}</td>
                  <td className="py-3.5 px-4 text-slate-500">{a.from} to {a.to}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">{a.days}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={a.status === 'Approved' ? 'success' : 'warning'}>{a.status}</Badge>
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
