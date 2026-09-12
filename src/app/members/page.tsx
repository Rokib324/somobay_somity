'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';

interface Member {
  _id: string;
  accountNo: string;
  name: string;
  mobile: string;
  nid: string;
  category: string;
  branch: string;
  totalDeposit: number;
  status: 'active' | 'inactive' | 'pending';
}

const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300';

const CATEGORIES = ['General Member', 'VIP Member', 'Micro Business', 'Agricultural Member', 'Staff Member'];

export default function MembersListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const [form, setForm] = useState({
    name: '', mobile: '', fatherName: '', motherName: '',
    nid: '', address: '', category: 'General Member', branch: '',
    status: 'active',
  });

  const fetchMembers = useCallback(async (q = '', page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: q, page: String(page), limit: '20' });
      const res = await fetch(`/api/members?${params}`);
      const data = await res.json();
      setMembers(data.members ?? []);
      setPagination(data.pagination ?? { total: 0, page: 1, pages: 1 });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBranches = async () => {
    const res = await fetch('/api/settings/branches');
    const data = await res.json();
    const names = (data.branches ?? []).map((b: { name: string }) => b.name);
    setBranches(names);
    if (names.length > 0) setForm(f => ({ ...f, branch: names[0] }));
  };

  useEffect(() => {
    fetchMembers();
    fetchBranches();
  }, []);

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
    fetchMembers(q, 1);
  }, [fetchMembers]);

  // Pagination uses current search value via closure ref
  const handlePageChange = (page: number) => fetchMembers(search, page);

  const handleSave = async () => {
    if (!form.name || !form.mobile || !form.nid || !form.fatherName || !form.motherName) {
      alert('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save member');
        return;
      }
      setIsModalOpen(false);
      setForm({ name: '', mobile: '', fatherName: '', motherName: '', nid: '', address: '', category: 'General Member', branch: branches[0] || '', status: 'active' });
      fetchMembers('', 1);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Member Management Directory"
        subtitle="Manage registered cooperative society members, account profiles, categories, and branch transfers."
        breadcrumbs={[{ label: 'Members' }]}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-user-plus"></i>
              Register New Member
            </button>
            <Link
              href="/members/categories"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-layer-group"></i>
              Member Categories
            </Link>
          </div>
        }
      />

      <DataTable
        searchPlaceholder="Search by Name, Account No, Mobile, NID..."
        onSearch={handleSearch}
        isLoading={loading}
        columns={[
          { header: 'Account No', accessor: 'accountNo', className: 'font-bold text-blue-600' },
          { header: 'Member Name', accessor: 'name', className: 'font-semibold text-slate-900' },
          { header: 'Mobile Number', accessor: 'mobile', className: 'text-slate-600' },
          { header: 'NID Number', accessor: 'nid', className: 'text-slate-500 font-mono text-xs' },
          { header: 'Category', accessor: 'category', className: 'text-slate-700 font-medium' },
          { header: 'Branch', accessor: 'branch', className: 'text-slate-500' },
          { header: 'Total Savings', accessor: (item: Member) => `৳ ${item.totalDeposit.toLocaleString()}`, className: 'font-bold text-emerald-600' },
          {
            header: 'Status',
            accessor: (item: Member) => <Badge variant={item.status === 'active' ? 'success' : 'warning'}>{item.status}</Badge>,
          },
        ]}
        data={members}
        actions={(member: Member) => (
          <Link
            href={`/members/${member._id}`}
            className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-bold text-xs rounded-lg transition-colors inline-block"
          >
            View Details
          </Link>
        )}
      />
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 rounded text-xs font-semibold ${pagination.page === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-400 text-center mt-2">
        Showing {members.length} of {pagination.total} members
      </p>

      {/* New Member Registration Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Society Member"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg text-xs hover:bg-slate-200">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-xs hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Member Profile'}
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input type="text" placeholder="Member full name" className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
              <input type="text" placeholder="017xxxxxxxx" className={inputClass} value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Father's Name *</label>
              <input type="text" placeholder="Father name" className={inputClass} value={form.fatherName} onChange={e => setForm(f => ({ ...f, fatherName: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mother's Name *</label>
              <input type="text" placeholder="Mother name" className={inputClass} value={form.motherName} onChange={e => setForm(f => ({ ...f, motherName: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">NID Card No *</label>
              <input type="text" placeholder="National ID number" className={inputClass} value={form.nid} onChange={e => setForm(f => ({ ...f, nid: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Branch</label>
              <select className={inputClass} value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}>
                {branches.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Member Category</label>
              <select className={inputClass} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select className={inputClass} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Address</label>
            <textarea rows={2} placeholder="Full address" className={inputClass} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
