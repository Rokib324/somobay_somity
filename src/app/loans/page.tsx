'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';

interface LoanAccount {
  _id: string;
  loanNo: string;
  memberName: string;
  productName: string;
  principalAmount: number;
  paidAmount: number;
  dueAmount: number;
  installments: number;
  installmentType: string;
  status: string;
  applicationDate: string;
  branch: string;
}

const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300';

const STATUS_VARIANTS: Record<string, string> = {
  active: 'success', pending_approval: 'warning', approved: 'info',
  disbursed: 'success', closed: 'default', overdue: 'danger', rejected: 'danger',
};

export default function LoansOverviewPage() {
  const [loans, setLoans] = useState<LoanAccount[]>([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<Array<{ _id: string; name: string; accountNo: string }>>([]);
  const [products, setProducts] = useState<Array<{ _id: string; name: string; interestRate: number; installmentType: string }>>([]);
  const [branches, setBranches] = useState<string[]>([]);

  const [form, setForm] = useState({
    memberId: '', memberName: '', productId: '', productName: '',
    principalAmount: '', installments: '12', interestRate: '12',
    installmentType: 'Monthly', branch: '', purpose: '',
    guarantorName: '', guarantorPhone: '',
  });

  const fetchLoans = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: q, limit: '30' });
      const res = await fetch(`/api/loans?${params}`);
      const data = await res.json();
      setLoans(data.loans ?? []);
      setTotalOutstanding(data.totalOutstanding ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
    fetch('/api/members?limit=100').then(r => r.json()).then(d => setMembers(d.members ?? []));
    fetch('/api/loans/products').then(r => r.json()).then(d => setProducts(d.products ?? []));
    fetch('/api/settings/branches').then(r => r.json()).then(d => {
      const names = (d.branches ?? []).map((b: { name: string }) => b.name);
      setBranches(names);
      if (names.length) setForm(f => ({ ...f, branch: names[0] }));
    });
  }, []);

  const handleProductChange = (productId: string) => {
    const p = products.find(x => x._id === productId);
    setForm(f => ({
      ...f, productId,
      productName: p?.name ?? '',
      interestRate: String(p?.interestRate ?? '12'),
      installmentType: p?.installmentType ?? 'Monthly',
    }));
  };

  const handleSave = async () => {
    if (!form.memberId || !form.productId || !form.principalAmount) {
      alert('Member, Product, and Amount are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          principalAmount: Number(form.principalAmount),
          installments: Number(form.installments),
          interestRate: Number(form.interestRate),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to apply for loan');
        return;
      }
      setIsModalOpen(false);
      fetchLoans();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Loan Management & Portfolio"
        subtitle="Manage loan applications, approvals, disbursements, schedules, and active balances."
        breadcrumbs={[{ label: 'Loans' }]}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <i className="fa-solid fa-plus mr-1.5"></i>Apply New Loan
            </button>
            <Link
              href="/loans/disbursement"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              Disburse Loan
            </Link>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs text-amber-600 font-semibold">Total Outstanding</p>
          <p className="text-xl font-black text-amber-700 mt-1">৳ {totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-semibold">Total Loans</p>
          <p className="text-xl font-black text-blue-700 mt-1">{loans.length}</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
          <p className="text-xs text-rose-600 font-semibold">Overdue</p>
          <p className="text-xl font-black text-rose-700 mt-1">{loans.filter(l => l.status === 'overdue').length}</p>
        </div>
      </div>

      <DataTable
        searchPlaceholder="Search Loan No, Member Name, or Product..."
        onSearch={fetchLoans}
        isLoading={loading}
        columns={[
            { header: 'Loan No', accessor: 'loanNo', className: 'font-bold text-blue-600' },
            { header: 'Borrower Member', accessor: 'memberName', className: 'font-semibold text-slate-900' },
            { header: 'Loan Product', accessor: 'productName', className: 'text-slate-600' },
            { header: 'Principal (৳)', accessor: (item: LoanAccount) => `৳ ${item.principalAmount.toLocaleString()}`, className: 'font-bold text-slate-800' },
            { header: 'Paid Amount', accessor: (item: LoanAccount) => `৳ ${item.paidAmount.toLocaleString()}`, className: 'font-semibold text-emerald-600' },
            { header: 'Outstanding Due', accessor: (item: LoanAccount) => `৳ ${item.dueAmount.toLocaleString()}`, className: 'font-bold text-rose-600' },
            {
              header: 'Status',
              accessor: (item: LoanAccount) => (
                <Badge variant={(STATUS_VARIANTS[item.status] || 'info') as 'success' | 'warning' | 'info' | 'danger'}>
                  {item.status.replace('_', ' ')}
                </Badge>
              ),
            },
          ]}
          data={loans}
          actions={(loan: LoanAccount) => (
            <div className="flex gap-1">
              <Link
                href={`/loans/${loan._id}`}
                className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-blue-600 font-bold text-xs rounded-lg transition-colors"
              >
                View
              </Link>
            </div>
          )}
        />

      {/* New Loan Application Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Loan Application"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs disabled:opacity-60">
              {saving ? 'Submitting...' : 'Submit Application'}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Member *</label>
            <select className={inputClass} value={form.memberId} onChange={e => {
              const m = members.find(x => x._id === e.target.value);
              setForm(f => ({ ...f, memberId: e.target.value, memberName: m?.name ?? '' }));
            }}>
              <option value="">-- Select Member --</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.name} ({m.accountNo})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Loan Product *</label>
              <select className={inputClass} value={form.productId} onChange={e => handleProductChange(e.target.value)}>
                <option value="">-- Select Product --</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.interestRate}%)</option>)}
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
              <label className="block font-bold text-slate-700 mb-1">Principal Amount (৳) *</label>
              <input type="number" className={inputClass} value={form.principalAmount} onChange={e => setForm(f => ({ ...f, principalAmount: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">No. of Installments</label>
              <input type="number" className={inputClass} value={form.installments} onChange={e => setForm(f => ({ ...f, installments: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Loan Purpose</label>
            <input type="text" className={inputClass} value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="e.g. Home renovation, Business expansion" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Guarantor Name</label>
              <input type="text" className={inputClass} value={form.guarantorName} onChange={e => setForm(f => ({ ...f, guarantorName: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Guarantor Phone</label>
              <input type="text" className={inputClass} value={form.guarantorPhone} onChange={e => setForm(f => ({ ...f, guarantorPhone: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
