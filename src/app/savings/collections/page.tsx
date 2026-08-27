'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function SavingsCollectionPage() {
  const [memberCode, setMemberCode] = useState('AC-1001');
  const [collectionAmount, setCollectionAmount] = useState('500');

  return (
    <AppLayout>
      <PageHeader
        title="Daily Savings Collection Counter"
        subtitle="Record quick daily, weekly, or monthly savings deposit receipts."
        breadcrumbs={[{ label: 'Savings', href: '/savings/deposits' }, { label: 'Collection Counter' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-2xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); alert('Deposit Received Successfully!'); }} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Member Account</label>
            <input
              type="text"
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              placeholder="Search by AC No or Name"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
            />
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
            <h4 className="font-bold text-blue-900 text-sm">Md. Al-Amin Khan (AC-1001)</h4>
            <p className="text-slate-600">Daily Savings Account | Balance: ৳ 45,000</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Deposit Collection Amount (৳)</label>
            <input
              type="number"
              value={collectionAmount}
              onChange={(e) => setCollectionAmount(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-lg font-black text-emerald-700"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Collector / Field Officer</label>
            <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <option>Mahmuda Begum (Field Officer)</option>
              <option>Tariqul Islam (Accountant)</option>
            </select>
          </div>

          <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-md transition-colors">
            Post Collection & Send Receipt SMS
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
