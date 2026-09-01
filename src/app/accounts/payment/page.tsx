'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';


export default function VoucherPaymentPage() {
  const [voucherType, setVoucherType] = useState('Debit Payment Voucher');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');

  return (
    <AppLayout>
      <PageHeader
        title="Voucher Entry & Payment Journal"
        subtitle="Create debit, credit, or journal entry vouchers to post double-entry transactions."
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Voucher Entry' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-3xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); alert('Voucher Posted Successfully'); }} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Voucher Type</label>
              <select
                value={voucherType}
                onChange={(e) => setVoucherType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
              >
                <option>Debit Payment Voucher</option>
                <option>Credit Receipt Voucher</option>
                <option>Journal Voucher</option>
                <option>Contra Voucher</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Voucher Date</label>
              <input type="date" defaultValue="2026-08-23" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Debit Account Head</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                {[].map((h) => (
                  <option key={h.id}>{h.code} - {h.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Credit Account Head</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <option>1010 - Cash in Hand</option>
                <option>1020 - Cash at Bank (Sonali Bank)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Amount (৳ BDT)</label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Narration / Description</label>
            <textarea
              rows={3}
              placeholder="Provide complete description for audit trails..."
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button type="reset" className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200">
              Reset Form
            </button>
            <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors">
              Post Voucher Entry
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
