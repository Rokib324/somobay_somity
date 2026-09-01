'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface Branch {
  _id: string;
  code: string;
  name: string;
  manager: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  totalMembers: number;
}

const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', manager: '', phone: '', address: '', code: '', status: 'active' });

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/branches');
      const data = await res.json();
      setBranches(data.branches ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.manager || !form.phone) {
      alert('Name, Manager, and Phone are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/settings/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const err = await res.json(); alert(err.error || 'Failed'); return; }
      setIsModalOpen(false);
      setForm({ name: '', manager: '', phone: '', address: '', code: '', status: 'active' });
      fetchBranches();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Branch Management"
        subtitle="Manage all cooperative branch offices, managers, and contact information."
        breadcrumbs={[{ label: 'Settings', href: '/settings' }, { label: 'Branches' }]}
        action={
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors">
            <i className="fa-solid fa-building-circle-arrow-right mr-1.5"></i>Add Branch
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable
          searchPlaceholder="Search branches..."
          columns={[
            { header: 'Code', accessor: 'code', className: 'font-bold text-blue-600 font-mono' },
            { header: 'Branch Name', accessor: 'name', className: 'font-semibold' },
            { header: 'Manager', accessor: 'manager', className: 'text-slate-700' },
            { header: 'Phone', accessor: 'phone', className: 'text-slate-600' },
            { header: 'Address', accessor: 'address', className: 'text-slate-500' },
            { header: 'Members', accessor: 'totalMembers', className: 'font-bold text-emerald-700 text-center' },
            { header: 'Status', accessor: (item: Branch) => <Badge variant={item.status === 'active' ? 'success' : 'danger'}>{item.status}</Badge> },
          ]}
          data={branches}
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Branch"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs disabled:opacity-60">
              {saving ? 'Saving...' : 'Add Branch'}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch Name *</label>
              <input type="text" className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch Code</label>
              <input type="text" className={inputClass} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. UTT" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Manager Name *</label>
              <input type="text" className={inputClass} value={form.manager} onChange={e => setForm(f => ({ ...f, manager: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone *</label>
              <input type="text" className={inputClass} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Address</label>
            <textarea rows={2} className={inputClass} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
