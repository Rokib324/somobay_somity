'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface DepositAccount {
  _id: string;
  accountNo: string;
  memberName: string;
  type: string;
  amount: number;
  interestRate: number;
  balance: number;
  status: 'active' | 'matured' | 'closed';
  openingDate: string;
  branch: string;
}

const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300';

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<DepositAccount[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<Array<{ _id: string; name: string; accountNo: string }>>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    memberId: '', memberName: '', type: 'Daily Savings',
    amount: '', interestRate: '7.5', termMonths: '', branch: '',
  });

  const fetchDeposits = useCallback(async (q = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: q, limit: '30' });
      const res = await fetch(`/api/savings/deposits?${params}`);
      const data = await res.json();
      setDeposits(data.deposits ?? []);
      setTotalBalance(data.totalBalance ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDeposits();
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

  const handleSave = async () => {
    if (!form.memberId || !form.amount) {
      alert('Member and amount are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/savings/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount), interestRate: Number(form.interestRate), termMonths: form.termMonths ? Number(form.termMonths) : undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to create account');
        return;
      }
      setIsModalOpen(false);
      fetchDeposits('');
    } finally {
      setSaving(false);
    }
  };

  const typeColors: Record<string, string> = {
    'Daily Savings': 'info', 'Monthly DPS': 'success',
    'Fixed Deposit (FDR)': 'warning', 'Share Capital': 'purple',
  };

  return (
    <AppLayout>
      <PageHeader
        title="Savings Deposit Accounts"
        subtitle="Manage all member savings accounts — daily, DPS, FDR, and share capital."
        breadcrumbs={[{ label: 'Savings', href: '/savings/deposits' }, { label: 'Deposits' }]}
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <i className="fa-solid fa-plus mr-1.5"></i>Open New Account
          </button>
        }
      />

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <p className="text-xs text-emerald-600 font-semibold">Total Active Balance</p>
          <p className="text-xl font-black text-emerald-700 mt-1">৳ {totalBalance.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-semibold">Total Accounts</p>
          <p className="text-xl font-black text-blue-700 mt-1">{deposits.length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs text-amber-600 font-semibold">Active Accounts</p>
          <p className="text-xl font-black text-amber-700 mt-1">{deposits.filter(d => d.status === 'active').length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable
          searchPlaceholder="Search by account no or member name..."
          onSearch={q => { setSearch(q); fetchDeposits(q); }}
          columns={[
            { header: 'Account No', accessor: 'accountNo', className: 'font-bold text-blue-600' },
            { header: 'Member Name', accessor: 'memberName', className: 'font-semibold' },
            { header: 'Type', accessor: (item: DepositAccount) => <Badge variant={(typeColors[item.type] || 'info') as 'info' | 'success' | 'warning' | 'danger' | 'purple'}>{item.type}</Badge> },
            { header: 'Installment/Deposit', accessor: (item: DepositAccount) => `৳ ${item.amount.toLocaleString()}`, className: 'font-medium' },
            { header: 'Interest Rate', accessor: (item: DepositAccount) => `${item.interestRate}%`, className: 'text-emerald-600 font-semibold' },
            { header: 'Current Balance', accessor: (item: DepositAccount) => `৳ ${item.balance.toLocaleString()}`, className: 'font-bold text-emerald-700' },
            { header: 'Branch', accessor: 'branch', className: 'text-slate-500' },
            { header: 'Status', accessor: (item: DepositAccount) => <Badge variant={item.status === 'active' ? 'success' : 'warning'}>{item.status}</Badge> },
          ]}
          data={deposits}
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Open New Savings Account"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs hover:bg-slate-200">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700 disabled:opacity-60">
              {saving ? 'Opening...' : 'Open Account'}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Member</label>
            <select className={inputClass} value={form.memberId} onChange={e => handleMemberChange(e.target.value)}>
              <option value="">-- Select Member --</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.name} ({m.accountNo})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Type</label>
              <select className={inputClass} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {['Daily Savings', 'Monthly DPS', 'Fixed Deposit (FDR)', 'Share Capital'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch</label>
              <select className={inputClass} value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}>
                {branches.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Deposit Amount (৳)</label>
              <input type="number" className={inputClass} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Interest Rate (%)</label>
              <input type="number" className={inputClass} value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} step="0.5" />
            </div>
          </div>
          {(form.type === 'Monthly DPS' || form.type === 'Fixed Deposit (FDR)') && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Term (Months)</label>
              <input type="number" className={inputClass} value={form.termMonths} onChange={e => setForm(f => ({ ...f, termMonths: e.target.value }))} placeholder="e.g. 36" />
            </div>
          )}
        </div>
      </Modal>
    </AppLayout>
  );
}
