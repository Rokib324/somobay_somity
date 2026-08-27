'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function LoanProductsPage() {
  const products = [
    { title: 'Small Business Micro Loan', interest: '12.0% Flat', maxAmt: '৳ 2,000,000', type: 'Weekly/Monthly' },
    { title: 'Enterprise Growth Loan', interest: '14.0% Flat', maxAmt: '৳ 5,000,000', type: 'Monthly' },
    { title: 'Emergency Member Loan', interest: '10.0% Flat', maxAmt: '৳ 100,000', type: 'Daily/Weekly' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Loan Products & Schemes"
        subtitle="Manage interest rates, repayment tenure options, and sanction limits."
        breadcrumbs={[{ label: 'Loans', href: '/loans' }, { label: 'Products' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {products.map((p, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 card-shadow space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{p.interest}</span>
              <span className="text-[10px] text-slate-400 font-semibold">{p.type}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{p.title}</h3>
            <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div>Max Limit: <span className="font-semibold text-slate-800">{p.maxAmt}</span></div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
