'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function SavingsTypesPage() {
  const schemes = [
    { title: 'Daily Savings Scheme', rate: '7.5% p.a.', minAmt: '৳ 100', term: 'Flexible', active: '1,420 Accounts' },
    { title: 'Monthly DPS Scheme', rate: '9.0% p.a.', minAmt: '৳ 500', term: '1 to 5 Years', active: '890 Accounts' },
    { title: 'Fixed Deposit (FDR)', rate: '11.5% p.a.', minAmt: '৳ 50,000', term: '1 to 3 Years', active: '320 Accounts' },
    { title: 'Share Capital Deposit', rate: '12.0% Dividend', minAmt: '৳ 1,000', term: 'Permanent', active: '2,960 Accounts' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Savings Products & Schemes"
        subtitle="Manage interest return rates, minimum deposit rules, and maturity terms."
        breadcrumbs={[{ label: 'Savings', href: '/savings/deposits' }, { label: 'Types / Schemes' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {schemes.map((s, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 card-shadow space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{s.rate}</span>
              <span className="text-[10px] text-slate-400 font-semibold">{s.active}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
            <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div>Min Deposit: <span className="font-semibold text-slate-800">{s.minAmt}</span></div>
              <div>Duration: <span className="font-semibold text-slate-800">{s.term}</span></div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
