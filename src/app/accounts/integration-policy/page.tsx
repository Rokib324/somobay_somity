'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function IntegrationPolicyPage() {
  const policies = [
    { module: 'Savings Collection', debitHead: '1010 - Cash in Hand', creditHead: '2010 - General Savings Deposit', autoPost: true },
    { module: 'Loan Disbursement', debitHead: '1050 - Loans Receivable', creditHead: '1010 - Cash in Hand', autoPost: true },
    { module: 'Interest Revenue Posting', debitHead: '1050 - Loans Receivable', creditHead: '4000 - Loan Interest Income', autoPost: true },
    { module: 'Payroll Disbursement', debitHead: '5000 - Staff Salary Expense', creditHead: '1020 - Cash at Bank', autoPost: false },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Accounts Integration Policy"
        subtitle="Automatic double-entry posting rules linking savings, loans, and HR operations to chart of accounts."
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Integration Policy' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Operational Module</th>
                <th className="py-3 px-4">Automatic Debit Head</th>
                <th className="py-3 px-4">Automatic Credit Head</th>
                <th className="py-3 px-4">Auto Post</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policies.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{p.module}</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-medium">{p.debitHead}</td>
                  <td className="py-3.5 px-4 text-rose-700 font-medium">{p.creditHead}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">{p.autoPost ? 'ENABLED' : 'MANUAL'}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-blue-600 hover:underline font-semibold">Configure Rule</button>
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
