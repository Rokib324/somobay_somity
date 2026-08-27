'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function MemberCategoriesPage() {
  const categories = [
    { name: 'General Member', fee: 500, minDeposit: 100, maxLoanLimit: 500000, activeMembers: 1850 },
    { name: 'Micro Business', fee: 1000, minDeposit: 500, maxLoanLimit: 1200000, activeMembers: 720 },
    { name: 'VIP Member', fee: 5000, minDeposit: 2000, maxLoanLimit: 5000000, activeMembers: 390 },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Member Categories Setup"
        subtitle="Define membership tiers, registration fees, minimum deposit thresholds, and maximum loan limits."
        breadcrumbs={[{ label: 'Members', href: '/members' }, { label: 'Categories' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">{cat.name}</h3>
              <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full">{cat.activeMembers} Members</span>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between"><span>Admission Fee:</span> <span className="font-bold text-slate-800">৳ {cat.fee}</span></div>
              <div className="flex justify-between"><span>Minimum Monthly Deposit:</span> <span className="font-bold text-slate-800">৳ {cat.minDeposit}</span></div>
              <div className="flex justify-between"><span>Maximum Loan Ceiling:</span> <span className="font-bold text-emerald-600">৳ {cat.maxLoanLimit.toLocaleString()}</span></div>
            </div>
            <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
              Edit Category Rules
            </button>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
