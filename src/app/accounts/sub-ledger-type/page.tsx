'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function SubLedgerTypePage() {
  const types = [
    { code: 'SLT-01', name: 'Member Savings Sub-Ledger', description: 'Individual savings balance records for society members.' },
    { code: 'SLT-02', name: 'Member Loan Sub-Ledger', description: 'Disbursed principal and interest repayment balances per member.' },
    { code: 'SLT-03', name: 'Employee Payroll Sub-Ledger', description: 'Staff salary accumulators, deductions, and tax withholdings.' },
    { code: 'SLT-04', name: 'Vendor / Supplier Sub-Ledger', description: 'Accounts payable accounts for office equipment and software suppliers.' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Sub-Ledger Classification Types"
        subtitle="Manage custom sub-ledger definitions for detailed multi-entity accounting."
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Sub-Ledger Type' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">Configured Sub-Ledger Types</h3>
          <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg">
            + New Sub-Ledger Type
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {types.map((item) => (
            <div key={item.code} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.code}</span>
                <span className="text-xs text-slate-400 font-semibold">Active</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
