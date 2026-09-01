'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';

interface AccountHead {
  _id: string;
  code: string;
  name: string;
  group: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  type: string;
  parentCode?: string;
  balance: number;
  status: 'active' | 'inactive';
}

const GROUP_COLORS: Record<string, string> = {
  Asset: 'info', Liability: 'warning', Equity: 'purple', Income: 'success', Expense: 'danger',
};

const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300';

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<AccountHead[]>([]);
  const [summary, setSummary] = useState<Array<{ _id: string; total: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '', name: '', group: 'Asset', type: 'detail', parentCode: '', description: '',
  });

  const fetchAccounts = async (group = filterGroup) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (group) params.set('group', group);
      const res = await fetch(`/api/accounts/chart-of-accounts?${params}`);
      const data = await res.json();
      setAccounts(data.accounts ?? []);
      setSummary(data.summary ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.name) { alert('Code and Name are required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/accounts/chart-of-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to create account');
        return;
      }
      setShowForm(false);
      setForm({ code: '', name: '', group: 'Asset', type: 'detail', parentCode: '', description: '' });
      fetchAccounts();
    } finally {
      setSaving(false);
    }
  };

  const getSummaryTotal = (group: string) => summary.find(s => s._id === group)?.total ?? 0;

  return (
    <AppLayout>
      <PageHeader
        title="Chart of Accounts"
        subtitle="Manage the full accounting hierarchy — assets, liabilities, equity, income, and expenses."
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Chart of Accounts' }]}
        action={
          <button
            onClick={() => setShowForm(v => !v)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <i className="fa-solid fa-plus mr-1.5"></i>Add Account Head
          </button>
        }
      />

      {/* Group Balances Summary */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {['Asset', 'Liability', 'Equity', 'Income', 'Expense'].map(g => (
          <button
            key={g}
            onClick={() => { setFilterGroup(filterGroup === g ? '' : g); fetchAccounts(filterGroup === g ? '' : g); }}
            className={`p-3 rounded-xl border text-center transition-all ${filterGroup === g ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}
          >
            <p className={`text-xs font-bold text-slate-600`}>{g}</p>
            <p className="text-sm font-black text-slate-800 mt-1">৳ {getSummaryTotal(g).toLocaleString()}</p>
          </button>
        ))}
      </div>

      {/* New Account Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-100 p-5 mb-5 card-shadow">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Add New Account Head</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Code *</label>
              <input type="text" className={inputClass} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. 1103" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Name *</label>
              <input type="text" className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Group</label>
              <select className={inputClass} value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))}>
                {['Asset', 'Liability', 'Equity', 'Income', 'Expense'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Type</label>
              <select className={inputClass} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="detail">Detail (Posting)</option>
                <option value="control">Control (Group)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Parent Code</label>
              <input type="text" className={inputClass} value={form.parentCode} onChange={e => setForm(f => ({ ...f, parentCode: e.target.value }))} placeholder="e.g. 1100" />
            </div>
            <div className="md:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <input type="text" className={inputClass} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Account Head'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs hover:bg-slate-200">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable
          searchPlaceholder="Search by code, name..."
          columns={[
            { header: 'Code', accessor: 'code', className: 'font-mono font-bold text-blue-600' },
            { header: 'Account Name', accessor: 'name', className: 'font-semibold text-slate-800' },
            { header: 'Group', accessor: (item: AccountHead) => <Badge variant={(GROUP_COLORS[item.group] || 'info') as 'info' | 'success' | 'warning' | 'danger' | 'purple'}>{item.group}</Badge> },
            { header: 'Type', accessor: 'type', className: 'text-slate-500 capitalize' },
            { header: 'Parent Code', accessor: (item: AccountHead) => item.parentCode || '—', className: 'text-slate-400 font-mono text-xs' },
            { header: 'Balance (৳)', accessor: (item: AccountHead) => `৳ ${item.balance.toLocaleString()}`, className: 'font-bold text-slate-800' },
            { header: 'Status', accessor: (item: AccountHead) => <Badge variant={item.status === 'active' ? 'success' : 'danger'}>{item.status}</Badge> },
          ]}
          data={accounts}
        />
      )}
    </AppLayout>
  );
}
