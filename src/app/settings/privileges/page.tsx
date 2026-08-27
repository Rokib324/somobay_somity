'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function PrivilegeMatrixPage() {
  const matrix = [
    { role: 'Super Admin', accounts: 'Full Control', members: 'Full Control', loans: 'Full Control', hr: 'Full Control' },
    { role: 'Branch Manager', accounts: 'View & Post', members: 'Full Control', loans: 'Approve & View', hr: 'View Only' },
    { role: 'Accountant', accounts: 'Full Control', members: 'View Only', loans: 'View Only', hr: 'Payroll Only' },
    { role: 'Field Officer', accounts: 'No Access', members: 'Add & View', loans: 'Collect Only', hr: 'No Access' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Role Menu Privilege Matrix"
        subtitle="Configure module access permissions and action privileges per role."
        breadcrumbs={[{ label: 'Settings', href: '/settings' }, { label: 'Privileges' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">User Role</th>
                <th className="py-3 px-4">Accounts Module</th>
                <th className="py-3 px-4">Members Module</th>
                <th className="py-3 px-4">Loans & Deposits</th>
                <th className="py-3 px-4">HR & Payroll</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrix.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{m.role}</td>
                  <td className="py-3.5 px-4 font-semibold text-blue-600">{m.accounts}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600">{m.members}</td>
                  <td className="py-3.5 px-4 font-semibold text-amber-600">{m.loans}</td>
                  <td className="py-3.5 px-4 font-semibold text-purple-600">{m.hr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
