'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useRouter } from 'next/navigation';

export default function CreateSavingsAccountPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Array<{ _id: string; name: string; accountNo: string }>>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    memberId: '', memberName: '', type: 'Daily Savings',
    amount: '', interestRate: '7.5', termMonths: '', branch: '',
  });

  useEffect(() => {
    fetch('/api/members?limit=100').then(r => r.json()).then(d => setMembers(d.members ?? []));
    fetch('/api/settings/branches').then(r => r.json()).then(d => {
      const names = (d.branches ?? []).map((b: { name: string }) => b.name);
      setBranches(names);
      if (names.length) setForm(f => ({ ...f, branch: names[0] }));
    });
  }, []);

  const handleMemberChange = (memberId: string) => {
    const m = members.find(x => x._id === memberId);
    setForm(f => ({ ...f, memberId, memberName: m?.name ?? '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.memberId || !form.amount) {
      alert('Member and amount are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/savings/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          interestRate: Number(form.interestRate),
          termMonths: form.termMonths ? Number(form.termMonths) : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to create account');
        return;
      }
      alert('Savings Account opened successfully!');
      router.push('/savings/deposits');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300';

  return (
    <AppLayout>
      <PageHeader
        title="Open New Savings Scheme Account"
        subtitle="Configure new DPS, FDR, or Daily Savings account for registered members."
        breadcrumbs={[{ label: 'Savings', href: '/savings/deposits' }, { label: 'New Account' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Member *</label>
              <select className={inputClass} value={form.memberId} onChange={e => handleMemberChange(e.target.value)}>
                <option value="">-- Select Member --</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name} ({m.accountNo})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Savings Scheme Type</label>
              <select className={inputClass} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {['Daily Savings', 'Monthly DPS', 'Fixed Deposit (FDR)', 'Share Capital'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Deposit Amount (৳) *</label>
              <input type="number" placeholder="e.g. 2000" className={inputClass} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Interest Rate (%)</label>
              <input type="number" step="0.5" className={inputClass} value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch</label>
              <select className={inputClass} value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}>
                {branches.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {(form.type === 'Monthly DPS' || form.type === 'Fixed Deposit (FDR)') && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Term (Months)</label>
              <input type="number" placeholder="e.g. 36" className={inputClass} value={form.termMonths} onChange={e => setForm(f => ({ ...f, termMonths: e.target.value }))} />
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={() => router.push('/savings/deposits')} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Savings Account'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
