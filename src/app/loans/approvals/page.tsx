'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';

export default function LoanApprovalsPage() {
  const pendingLoans = [
    { id: 'AP-101', member: 'Kamrul Hasan (AC-1005)', amount: 150000, product: 'Small Business Micro Loan', appliedDate: '2026-08-21', status: 'Pending Manager Approval' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Loan Application Approvals Queue"
        subtitle="Review, approve, or reject member loan applications."
        breadcrumbs={[{ label: 'Loans', href: '/loans' }, { label: 'Approvals' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Applicant Member</th>
                <th className="py-3 px-4">Product Scheme</th>
                <th className="py-3 px-4">Requested Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingLoans.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-blue-600">{l.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{l.member}</td>
                  <td className="py-3.5 px-4 text-slate-600">{l.product}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">৳ {l.amount.toLocaleString()}</td>
                  <td className="py-3.5 px-4"><Badge variant="warning">{l.status}</Badge></td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button className="px-3 py-1 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700">Approve</button>
                    <button className="px-3 py-1 bg-rose-600 text-white font-bold rounded hover:bg-rose-700">Reject</button>
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
