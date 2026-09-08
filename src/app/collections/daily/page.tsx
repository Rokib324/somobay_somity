'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

interface CollectionRow {
  loanId: string;
  memberId: string;
  accountNo: string;
  memberName: string;
  loanNo: string;
  targetLoan: number;
  targetSavings: number;
  collectedLoan: number;
  collectedSavings: number;
}

interface ActiveLoan {
  _id: string;
  loanNo: string;
  memberId: string;
  memberName: string;
  installmentAmount: number;
  dueAmount: number;
  branch: string;
}

export default function DailyCollectionSheetPage() {
  const [rows, setRows] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [collectedBy, setCollectedBy] = useState('Field Officer');
  const [branch, setBranch] = useState('');
  const [branches, setBranches] = useState<string[]>([]);

  const fetchLoans = useCallback(async (br = branch) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: 'active', limit: '50' });
      if (br) params.set('branch', br);
      const res = await fetch(`/api/loans?${params}`);
      const data = await res.json();
      const loans: ActiveLoan[] = data.loans ?? [];
      setRows(loans.map(l => ({
        loanId: l._id,
        memberId: l.memberId,
        accountNo: l.loanNo,
        memberName: l.memberName,
        loanNo: l.loanNo,
        targetLoan: l.installmentAmount,
        targetSavings: 0,
        collectedLoan: l.installmentAmount,
        collectedSavings: 0,
      })));
    } finally {
      setLoading(false);
    }
  }, [branch]);

  useEffect(() => {
    fetch('/api/settings/branches').then(r => r.json()).then(d => {
      const names = (d.branches ?? []).map((b: { name: string }) => b.name);
      setBranches(names);
      if (names.length) { setBranch(names[0]); }
    });
  }, []);

  useEffect(() => {
    if (branch !== undefined) fetchLoans(branch);
  }, [branch, fetchLoans]);

  const updateRow = (idx: number, field: 'collectedLoan' | 'collectedSavings', value: number) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const handleBatchSave = async () => {
    const collections = rows.filter(r => r.collectedLoan > 0 || r.collectedSavings > 0);
    if (collections.length === 0) {
      alert('No collections entered');
      return;
    }
    setSaving(true);
    try {
      const entries = collections.flatMap(r => {
        const arr = [];
        if (r.collectedLoan > 0) {
          arr.push({
            memberId: r.memberId,
            memberName: r.memberName,
            accountId: r.loanId,
            accountNo: r.loanNo,
            amount: r.collectedLoan,
            type: 'loan_installment',
            date: new Date(date),
            collectedBy,
            branch,
          });
        }
        return arr;
      });

      for (const entry of entries) {
        await fetch('/api/collections/daily', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      }

      alert(`${entries.length} collection(s) posted successfully!`);
      fetchLoans(branch);
    } finally {
      setSaving(false);
    }
  };

  const totalLoan = rows.reduce((s, r) => s + r.collectedLoan, 0);
  const totalSavings = rows.reduce((s, r) => s + r.collectedSavings, 0);

  return (
    <AppLayout>
      <PageHeader
        title="Daily Field Collection Sheet"
        subtitle="Batch entry for field officers during daily / weekly collection rounds."
        breadcrumbs={[{ label: 'Collections', href: '/collections' }, { label: 'Daily Field Sheet' }]}
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 card-shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Collection Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Branch</label>
            <select value={branch} onChange={e => setBranch(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs">
              {branches.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Collected By</label>
            <input type="text" value={collectedBy} onChange={e => setCollectedBy(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs" />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleBatchSave}
              disabled={saving || rows.length === 0}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm disabled:opacity-50 transition-colors"
            >
              {saving ? 'Posting...' : 'Batch Save & Post'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Active Loan Accounts — {branch}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Edit amounts and click Batch Save to post</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold text-emerald-700">Total Loan: ৳ {totalLoan.toLocaleString()}</p>
            <p className="font-bold text-blue-700">Total Savings: ৳ {totalSavings.toLocaleString()}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No active loans found for this branch</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="py-3 px-4">Loan No</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4 text-right">Target Installment (৳)</th>
                  <th className="py-3 px-4 text-right">Loan Collection (৳)</th>
                  <th className="py-3 px-4 text-right">Total Collected (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, idx) => (
                  <tr key={r.loanId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-blue-600">{r.loanNo}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{r.memberName}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-500">
                      ৳ {r.targetLoan.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <input
                        type="number"
                        value={r.collectedLoan}
                        onChange={e => updateRow(idx, 'collectedLoan', Number(e.target.value))}
                        className="w-28 p-1.5 border border-slate-200 rounded text-right font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      ৳ {(r.collectedLoan + r.collectedSavings).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-emerald-50 border-t-2 border-emerald-200 font-bold text-xs">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-slate-700">Grand Total</td>
                  <td className="py-3 px-4 text-right text-blue-700">৳ {totalLoan.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-emerald-700">৳ {(totalLoan + totalSavings).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
