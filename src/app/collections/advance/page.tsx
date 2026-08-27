'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function AdvanceCollectionPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Advance Collections & Pre-payments"
        subtitle="Manage advance installment pre-payments made by members before installment due dates."
        breadcrumbs={[{ label: 'Collections', href: '/collections' }, { label: 'Advance Collections' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-2xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); alert('Advance Payment Recorded'); }} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Member Account</label>
            <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <option>AC-1004 — Sharmin Sultana (Active Enterprise Loan)</option>
              <option>AC-1001 — Md. Al-Amin Khan (Monthly DPS)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Advance Installments Count</label>
            <input type="number" defaultValue={3} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Total Pre-payment Amount (৳)</label>
            <input type="number" defaultValue={15000} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-lg font-black text-emerald-700" />
          </div>

          <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-md">
            Record Advance Pre-payment
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
