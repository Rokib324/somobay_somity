'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
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

export default function AccountDescriptionPage() {
  const [accounts, setAccounts] = useState<AccountHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('All Account Groups');
  const [search, setSearch] = useState('');

  const fetchAccounts = async (group = selectedGroup) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (group && group !== 'All Account Groups') {
        const cleanGroup = group.split(' ')[0];
        params.set('group', cleanGroup);
      }
      const res = await fetch(`/api/accounts/chart-of-accounts?${params}`);
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAccounts(selectedGroup);
  };

  const filteredAccounts = accounts.filter((head) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return head.name.toLowerCase().includes(q) || head.code.toLowerCase().includes(q);
  });

  return (
    <AppLayout>
      <PageHeader
        title="Account Head Descriptions"
        subtitle="Detailed configuration and accounting rules for every chart of account ledger head."
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Account Description' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6">
        <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Filter by Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option>All Account Groups</option>
              <option>Asset (1000)</option>
              <option>Liability (2000)</option>
              <option>Equity (3000)</option>
              <option>Income (4000)</option>
              <option>Expense (5000)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Search Head</label>
            <input
              type="text"
              placeholder="e.g. Cash in Hand"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </form>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading account heads...</div>
          ) : filteredAccounts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No account heads found.</div>
          ) : (
            filteredAccounts.map((head) => (
              <div key={head._id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono font-bold text-xs rounded-md">
                      {head.code}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{head.name}</h4>
                    <Badge variant={head.group === 'Asset' ? 'info' : 'success'}>{head.group}</Badge>
                  </div>
                  <span className="font-bold text-slate-800 text-sm">৳ {(head.balance || 0).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Standard ledger account head under parent category {head.parentCode || 'Root'}. Used for recording all routine general accounting debit/credit transactions in the Somity ERP subsystem.
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
