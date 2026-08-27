'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { mockAccountHeads } from '@/data/mockData';

export default function ChartOfAccountsPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Chart of Accounts (COA) Tree"
        subtitle="Hierarchical structure of all asset, liability, equity, income, and expense accounts."
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Chart of Accounts' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow">
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base">Co-Operative Chart of Accounts</h3>
              <p className="text-xs text-slate-400">Total 5 Major Groups | 51 Active Ledger Accounts</p>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg">
              Expand All
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {mockAccountHeads.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-blue-600 w-16">{item.code}</span>
                  <span className="font-sans font-bold text-slate-800 text-sm">{item.name}</span>
                </div>
                <div className="flex items-center gap-4 font-sans">
                  <span className="text-slate-400 text-xs">{item.group}</span>
                  <span className="font-bold text-slate-900">৳ {item.balance.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
