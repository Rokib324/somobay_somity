'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import Link from 'next/link';

export default function SavingsTypesPage() {
  const schemes = [
    { title: 'Share Capital Deposit', rate: '12.0% Dividend', minAmt: '৳ 1,000', term: 'Permanent (Mandatory Prerequisite)', active: 'Active Scheme', desc: 'Core cooperative equity share required for all active members before opening other books.', badge: 'Prerequisite' },
    { title: 'Regular Savings Scheme', rate: '6.5% p.a.', minAmt: '৳ 200', term: 'Flexible On-Demand', active: 'Active Scheme', desc: 'Standard open deposit ledger with instant withdrawal access.', badge: 'Popular' },
    { title: 'Daily Savings Scheme', rate: '7.5% p.a.', minAmt: '৳ 100', term: 'Daily Flexible', active: 'Active Scheme', desc: 'Doorstep daily field collection designed for small business shopkeepers and farmers.', badge: 'Daily' },
    { title: 'Monthly DPS Scheme', rate: '9.0% p.a.', minAmt: '৳ 500', term: '1 to 5 Years', active: 'Active Scheme', desc: 'Recurring monthly deposit scheme with compounded interest upon maturity.', badge: 'Savings' },
    { title: 'Fixed Deposit (FDR)', rate: '11.5% p.a.', minAmt: '৳ 50,000', term: '1 to 3 Years', active: 'Active Scheme', desc: 'High-yield lump sum deposit with quarterly or term-end profit payout.', badge: 'Investment' },
    { title: 'Special Savings Scheme', rate: '8.0% p.a.', minAmt: '৳ 1,000', term: 'Flexible', active: 'Active Scheme', desc: 'Targeted contingency and medical emergency reserve fund account.', badge: 'Special' },
    { title: 'Millionaire Scheme', rate: '10.5% p.a.', minAmt: '৳ 2,500/mo', term: '5 to 10 Years', active: 'Active Scheme', desc: 'Long-term wealth creation scheme structured to yield ৳ 1,000,000+ at maturity.', badge: 'Wealth' },
    { title: 'Pension Deposit Scheme', rate: '10.0% p.a.', minAmt: '৳ 1,500/mo', term: '10 Years', active: 'Active Scheme', desc: 'Retirement security fund providing guaranteed monthly annuity pensions.', badge: 'Retirement' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Savings Products & Schemes Directory"
        subtitle="Manage interest return rates, minimum deposit rules, maturity tenures, and prerequisite share account guidelines."
        breadcrumbs={[{ label: 'Savings', href: '/savings/deposits' }, { label: 'Types / Schemes' }]}
        action={
          <Link
            href="/savings/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <i className="fa-solid fa-plus"></i>
            Open New Account
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {schemes.map((s, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 card-shadow space-y-3 flex flex-col justify-between hover:border-blue-400 transition-all">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.badge === 'Prerequisite' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-50 text-emerald-700'}`}>
                  {s.rate}
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{s.badge}</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">{s.title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-slate-400">Min Deposit:</span>
                <span className="font-bold text-slate-800">{s.minAmt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="font-bold text-slate-800">{s.term}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
