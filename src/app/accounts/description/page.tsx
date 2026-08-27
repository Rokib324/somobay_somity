'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { mockAccountHeads } from '@/data/mockData';
import { Badge } from '@/components/ui/Badge';

export default function AccountDescriptionPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Account Head Descriptions"
        subtitle="Detailed configuration and accounting rules for every chart of account ledger head."
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Account Description' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Filter by Group</label>
            <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <option>All Account Groups</option>
              <option>Asset (1000)</option>
              <option>Liability (2000)</option>
              <option>Equity (3000)</option>
              <option>Income (4000)</option>
              <option>Expense (5000)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Search Head</label>
            <input type="text" placeholder="e.g. Cash in Hand" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
          </div>
          <div className="flex items-end">
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg">
              Apply Filters
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {mockAccountHeads.map((head) => (
            <div key={head.id} className="py-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono font-bold text-xs rounded-md">
                    {head.code}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{head.name}</h4>
                  <Badge variant={head.group === 'Asset' ? 'info' : 'success'}>{head.group}</Badge>
                </div>
                <span className="font-bold text-slate-800 text-sm">৳ {head.balance.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Standard ledger account head under parent category {head.parentCode || 'Root'}. Used for recording all routine general accounting debit/credit transactions in the Somity ERP subsystem.
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
