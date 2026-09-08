'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface LoanProduct {
  _id: string;
  code: string;
  name: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTermMonths: number;
  maxTermMonths: number;
  installmentType: string;
  description?: string;
  status: 'active' | 'inactive';
}

const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300';

export default function LoanProductsPage() {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    interestRate: '12',
    minAmount: '10000',
    maxAmount: '2000000',
    minTermMonths: '6',
    maxTermMonths: '60',
    installmentType: 'Monthly',
    description: '',
    status: 'active',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/loans/products');
      const data = await res.json();
      setProducts(data.products ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSave = async () => {
    if (!form.name || !form.interestRate) {
      alert('Name and Interest Rate are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/loans/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          interestRate: Number(form.interestRate),
          minAmount: Number(form.minAmount),
          maxAmount: Number(form.maxAmount),
          minTermMonths: Number(form.minTermMonths),
          maxTermMonths: Number(form.maxTermMonths),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to create product');
        return;
      }
      setIsModalOpen(false);
      setForm({ name: '', interestRate: '12', minAmount: '10000', maxAmount: '2000000', minTermMonths: '6', maxTermMonths: '60', installmentType: 'Monthly', description: '', status: 'active' });
      fetchProducts();
    } finally {
      setSaving(false);
    }
  };

  const TYPE_ICON: Record<string, string> = {
    Daily: 'fa-calendar-day',
    Weekly: 'fa-calendar-week',
    Monthly: 'fa-calendar',
  };

  return (
    <AppLayout>
      <PageHeader
        title="Loan Products & Schemes"
        subtitle="Manage interest rates, repayment tenure options, and sanction limits for all loan schemes."
        breadcrumbs={[{ label: 'Loans', href: '/loans' }, { label: 'Products' }]}
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <i className="fa-solid fa-plus mr-1.5" />Add Loan Product
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          <i className="fa-solid fa-file-invoice-dollar text-3xl text-slate-300 mb-3 block" />
          <p className="font-semibold">No loan products configured</p>
          <p className="text-xs mt-1">Add loan products to start accepting applications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div key={p._id} className="bg-white rounded-xl border border-slate-200 p-5 card-shadow space-y-3 hover:border-amber-200 transition-colors">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{p.code}</span>
                <Badge variant={p.status === 'active' ? 'success' : 'danger'}>{p.status}</Badge>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                {p.description && <p className="text-xs text-slate-400 mt-0.5">{p.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                <div className="bg-amber-50 rounded-lg p-2 text-center">
                  <p className="text-amber-700 font-black text-base">{p.interestRate}%</p>
                  <p className="text-amber-600 text-[10px] font-semibold">Interest Rate</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <p className="text-blue-700 font-black text-base">{p.maxTermMonths}m</p>
                  <p className="text-blue-600 text-[10px] font-semibold flex items-center justify-center gap-1">
                    <i className={`fa-solid ${TYPE_ICON[p.installmentType] || 'fa-calendar'} text-[9px]`} />
                    {p.installmentType}
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Min Loan:</span>
                  <span className="font-semibold text-slate-700">৳ {p.minAmount?.toLocaleString() ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Loan:</span>
                  <span className="font-semibold text-slate-700">৳ {p.maxAmount?.toLocaleString() ?? 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Loan Product"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs hover:bg-slate-200">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs hover:bg-amber-700 disabled:opacity-60">
              {saving ? 'Saving...' : 'Create Product'}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
            <input type="text" className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Small Business Micro Loan" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Interest Rate (%) *</label>
              <input type="number" className={inputClass} value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} step="0.5" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Installment Type</label>
              <select className={inputClass} value={form.installmentType} onChange={e => setForm(f => ({ ...f, installmentType: e.target.value }))}>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Min Amount (৳)</label>
              <input type="number" className={inputClass} value={form.minAmount} onChange={e => setForm(f => ({ ...f, minAmount: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Amount (৳)</label>
              <input type="number" className={inputClass} value={form.maxAmount} onChange={e => setForm(f => ({ ...f, maxAmount: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Min Term (Months)</label>
              <input type="number" className={inputClass} value={form.minTermMonths} onChange={e => setForm(f => ({ ...f, minTermMonths: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Term (Months)</label>
              <input type="number" className={inputClass} value={form.maxTermMonths} onChange={e => setForm(f => ({ ...f, maxTermMonths: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select className={inputClass} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea rows={2} className={inputClass} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of this loan product" />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
