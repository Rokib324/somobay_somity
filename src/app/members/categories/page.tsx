'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Modal } from '@/components/ui/Modal';

interface Category {
  _id?: string;
  name: string;
  code: string;
  fee: number;
  minDeposit: number;
  maxLoanLimit: number;
  description?: string;
  activeMembers: number;
  status?: string;
}

const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300';

export default function MemberCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    fee: 500,
    minDeposit: 200,
    maxLoanLimit: 500000,
    description: '',
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/members/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!form.name) {
      alert('Category name is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/members/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to create category');
        return;
      }
      setIsModalOpen(false);
      setForm({ name: '', code: '', fee: 500, minDeposit: 200, maxLoanLimit: 500000, description: '' });
      fetchCategories();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Member Categories Setup"
        subtitle="Define membership tiers, registration fees, minimum deposit thresholds, and maximum loan limits across 9 standard tiers."
        breadcrumbs={[{ label: 'Members', href: '/members' }, { label: 'Categories' }]}
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <i className="fa-solid fa-plus"></i>
            Add New Category
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div key={cat._id || idx} className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4 hover:border-blue-300 transition-all">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{cat.name}</h3>
                  <span className="text-[10px] font-mono text-blue-600 font-bold uppercase">{cat.code}</span>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <i className="fa-solid fa-users text-[10px]"></i>
                  {cat.activeMembers} Members
                </span>
              </div>

              {cat.description && (
                <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
              )}

              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-slate-500">Admission Fee:</span>
                  <span className="font-bold text-slate-800">৳ {cat.fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Min. Monthly Deposit:</span>
                  <span className="font-bold text-slate-800">৳ {cat.minDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Max. Loan Limit:</span>
                  <span className="font-bold text-emerald-600">৳ {cat.maxLoanLimit.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Membership Category"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg text-xs hover:bg-slate-200">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-xs hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Creating...' : 'Save Category'}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              placeholder="e.g. Cooperative Artisan"
              className={inputClass}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Category Code (Optional)</label>
            <input
              type="text"
              placeholder="e.g. CAT-ARTISAN"
              className={inputClass}
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Admission Fee (৳)</label>
              <input
                type="number"
                className={inputClass}
                value={form.fee}
                onChange={e => setForm(f => ({ ...f, fee: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Min. Monthly Deposit (৳)</label>
              <input
                type="number"
                className={inputClass}
                value={form.minDeposit}
                onChange={e => setForm(f => ({ ...f, minDeposit: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Max. Loan Limit (৳)</label>
            <input
              type="number"
              className={inputClass}
              value={form.maxLoanLimit}
              onChange={e => setForm(f => ({ ...f, maxLoanLimit: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Eligibility and membership terms"
              className={inputClass}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
