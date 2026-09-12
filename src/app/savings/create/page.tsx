'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useRouter } from 'next/navigation';

interface MemberItem {
  _id: string;
  name: string;
  accountNo: string;
  category: string;
  branch: string;
}

const SAVINGS_SCHEMES = [
  'Regular Savings',
  'Daily Savings',
  'Monthly DPS',
  'Fixed Deposit (FDR)',
  'Share Capital',
  'Special Savings',
  'Millionaire Scheme',
  'Pension Deposit Scheme',
];

const SAVINGS_CATEGORIES = [
  'General Savings',
  'Staff Savings',
  'Commercial / Business',
  'Emergency Fund',
  'Pensioner Reserve',
  'Special Investment',
];

export default function CreateSavingsAccountPage() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [checkingShare, setCheckingShare] = useState(false);
  const [hasShareAccount, setHasShareAccount] = useState<boolean | null>(null);

  const [form, setForm] = useState({
    memberId: '',
    memberName: '',
    type: 'Regular Savings',
    category: 'General Savings',
    amount: '1000',
    interestRate: '7.5',
    percentage: '0',
    priority: 'Normal',
    termMonths: '',
    branch: '',
  });

  useEffect(() => {
    fetch('/api/members?limit=200')
      .then(r => r.json())
      .then(d => setMembers(d.members ?? []));

    fetch('/api/settings/branches')
      .then(r => r.json())
      .then(d => {
        const names = (d.branches ?? []).map((b: { name: string }) => b.name);
        setBranches(names);
        if (names.length) setForm(f => ({ ...f, branch: names[0] }));
      });
  }, []);

  const checkMemberShareAccount = async (memberId: string) => {
    if (!memberId) {
      setHasShareAccount(null);
      return;
    }
    setCheckingShare(true);
    try {
      const res = await fetch(`/api/members/${memberId}`);
      const data = await res.json();
      const deposits = data.deposits || [];
      const hasShare = deposits.some((d: { type: string; status: string }) =>
        d.status === 'active' && d.type.toLowerCase().includes('share capital')
      );
      setHasShareAccount(hasShare);
    } catch {
      setHasShareAccount(null);
    } finally {
      setCheckingShare(false);
    }
  };

  const handleMemberChange = (memberId: string) => {
    const m = members.find(x => x._id === memberId);
    setForm(f => ({ ...f, memberId, memberName: m?.name ?? '', branch: m?.branch || f.branch }));
    checkMemberShareAccount(memberId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.memberId || !form.amount) {
      alert('Member and initial deposit amount are required');
      return;
    }

    if (form.type !== 'Share Capital' && hasShareAccount === false) {
      alert('Share Account Required: You must open a Share Capital account for this member first before opening other savings books.');
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
          percentage: Number(form.percentage) || 0,
          termMonths: form.termMonths ? Number(form.termMonths) : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to create savings account');
        return;
      }

      alert('Savings Account created and activated successfully!');
      router.push('/savings/deposits');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300';

  const isBlockedBySharePrerequisite = form.type !== 'Share Capital' && hasShareAccount === false;

  return (
    <AppLayout>
      <PageHeader
        title="Open New Savings Scheme Account"
        subtitle="Configure new DPS, FDR, Daily Savings, or Share Capital account with prerequisite compliance checks."
        breadcrumbs={[{ label: 'Savings', href: '/savings/deposits' }, { label: 'New Account' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-3xl mx-auto">
        {/* Share Account Prerequisite Warning Alert */}
        {form.memberId && hasShareAccount === false && (
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-start gap-3">
            <i className="fa-solid fa-triangle-exclamation text-amber-600 text-lg mt-0.5"></i>
            <div className="flex-1 text-xs text-amber-900 space-y-1">
              <h4 className="font-extrabold text-amber-950">Prerequisite Warning: No Active Share Account Found</h4>
              <p>
                Under cooperative society guidelines, <strong>{form.memberName}</strong> must hold a verified <strong>Share Capital Account</strong> before any other deposit books (DPS, FDR, Daily) can be activated.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: 'Share Capital', interestRate: '12.0' }))}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  Switch Scheme to "Share Capital"
                </button>
              </div>
            </div>
          </div>
        )}

        {form.memberId && hasShareAccount === true && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <i className="fa-solid fa-circle-check text-emerald-600"></i>
            <span>Share Account Prerequisite Verified: Member holds active Share Capital.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Member & Scheme */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Select Member * {checkingShare && <span className="text-[10px] text-blue-600">(verifying share account...)</span>}
              </label>
              <select className={inputClass} value={form.memberId} onChange={e => handleMemberChange(e.target.value)}>
                <option value="">-- Select Society Member --</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name} ({m.accountNo}) - {m.branch}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Savings Scheme Type *</label>
              <select className={inputClass} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {SAVINGS_SCHEMES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Branch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Savings Category</label>
              <select className={inputClass} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {SAVINGS_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch *</label>
              <select className={inputClass} value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}>
                {branches.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {/* Financial Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Opening Deposit (৳) *</label>
              <input
                type="number"
                placeholder="e.g. 2000"
                className={inputClass}
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={form.interestRate}
                onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Dividend / Share (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="0"
                className={inputClass}
                value={form.percentage}
                onChange={e => setForm(f => ({ ...f, percentage: e.target.value }))}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Priority</label>
              <select className={inputClass} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="Normal">Normal</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {(form.type === 'Monthly DPS' || form.type === 'Fixed Deposit (FDR)' || form.type === 'Millionaire Scheme' || form.type === 'Pension Deposit Scheme') && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Term Tenure (Months)</label>
              <input
                type="number"
                placeholder="e.g. 36 or 60"
                className={inputClass}
                value={form.termMonths}
                onChange={e => setForm(f => ({ ...f, termMonths: e.target.value }))}
              />
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            {isBlockedBySharePrerequisite && (
              <span className="text-rose-600 font-bold text-xs">
                * Creation blocked: Member needs a Share Capital account first.
              </span>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={() => router.push('/savings/deposits')}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || isBlockedBySharePrerequisite}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs disabled:opacity-50"
              >
                {saving ? 'Processing...' : 'Create Savings Account'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
