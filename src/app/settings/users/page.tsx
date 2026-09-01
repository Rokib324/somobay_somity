'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface SystemUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  branch: string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
}

const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300';
const ROLES = ['Super Admin', 'Branch Manager', 'Accountant', 'Field Officer'];

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', email: '', role: 'Field Officer', branch: '', password: 'default123', status: 'Active' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/users');
      const data = await res.json();
      setUsers(data.users ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchUsers();
    fetch('/api/settings/branches').then(r => r.json()).then(d => {
      const names = (d.branches ?? []).map((b: { name: string }) => b.name);
      setBranches(names);
      if (names.length) setForm(f => ({ ...f, branch: names[0] }));
    });
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.email) { alert('Name and Email are required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/settings/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const err = await res.json(); alert(err.error || 'Failed'); return; }
      setIsModalOpen(false);
      fetchUsers();
    } finally { setSaving(false); }
  };

  return (
    <AppLayout>
      <PageHeader
        title="System Users & Access Control"
        subtitle="Manage admin users, roles, and system access privileges."
        breadcrumbs={[{ label: 'Settings', href: '/settings' }, { label: 'Users' }]}
        action={
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors">
            <i className="fa-solid fa-user-plus mr-1.5"></i>Add System User
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable
          searchPlaceholder="Search users..."
          columns={[
            { header: 'Full Name', accessor: 'name', className: 'font-semibold' },
            { header: 'Email', accessor: 'email', className: 'text-slate-600 text-xs' },
            { header: 'Role', accessor: (item: SystemUser) => <Badge variant={item.role === 'Super Admin' ? 'danger' : item.role === 'Branch Manager' ? 'warning' : 'info'}>{item.role}</Badge> },
            { header: 'Branch', accessor: 'branch', className: 'text-slate-500' },
            { header: 'Last Login', accessor: (item: SystemUser) => item.lastLogin ? new Date(item.lastLogin).toLocaleDateString() : 'Never', className: 'text-slate-400 text-xs' },
            { header: 'Status', accessor: (item: SystemUser) => <Badge variant={item.status === 'Active' ? 'success' : 'danger'}>{item.status}</Badge> },
          ]}
          data={users}
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add System User"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs disabled:opacity-60">
              {saving ? 'Adding...' : 'Add User'}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input type="text" className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email *</label>
              <input type="email" className={inputClass} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Role</label>
              <select className={inputClass} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch</label>
              <select className={inputClass} value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}>
                {branches.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Initial Password</label>
            <input type="password" className={inputClass} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
