'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function AccountGroupPage() {
  const groups = [
    { code: '1000', name: 'Assets', type: 'Balance Sheet', headsCount: 14, totalBalance: 14500000 },
    { code: '2000', name: 'Liabilities', type: 'Balance Sheet', headsCount: 9, totalBalance: 18900000 },
    { code: '3000', name: 'Equity / Capital', type: 'Balance Sheet', headsCount: 4, totalBalance: 5000000 },
    { code: '4000', name: 'Revenue / Income', type: 'Profit & Loss', headsCount: 8, totalBalance: 2850000 },
    { code: '5000', name: 'Operating Expenses', type: 'Profit & Loss', headsCount: 18, totalBalance: 1420000 },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Account Groups Structure"
        subtitle="Primary categorization levels for accounting ledgers according to standard ERP practices."
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Account Group' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {groups.map((grp) => (
          <div key={grp.code} className="bg-white rounded-xl border border-slate-200 p-5 card-shadow space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                  Group {grp.code}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-1">{grp.name}</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">{grp.type}</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">{grp.headsCount} Ledger Heads</span>
              <span className="font-extrabold text-slate-900 text-sm">৳ {grp.totalBalance.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
