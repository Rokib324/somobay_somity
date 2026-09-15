'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { MemberIdCardModal } from '@/components/members/MemberIdCardModal';
import { BlankRegistrationFormModal } from '@/components/members/BlankRegistrationFormModal';
import { ImageUploadBox } from '@/components/common/ImageUploadBox';
import Link from 'next/link';

interface Member {
  _id: string;
  accountNo: string;
  name: string;
  fatherName?: string;
  motherName?: string;
  mobile: string;
  nid: string;
  category: string;
  branch: string;
  totalDeposit: number;
  status: 'active' | 'inactive' | 'pending';
  address?: string;
  photo?: string;
  signature?: string;
}

const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300';

export default function MembersListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlankFormOpen, setIsBlankFormOpen] = useState(false);
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([
    'Staff Member', 'Farmer Member', 'Business Member', 'Student Member',
    'Senior Citizen Member', 'Cooperative Member', 'Young Entrepreneur',
    'Association Member', 'Founder Member',
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const [form, setForm] = useState({
    name: '', mobile: '', fatherName: '', motherName: '',
    nid: '', address: '', category: 'Cooperative Member', branch: '',
    dateOfBirth: '', status: 'active',
    nomineeName: '', nomineeRelation: 'Spouse', nomineeNid: '', nomineePhone: '', nomineePercentage: 100,
    photo: '', signature: '',
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
    try {
      const res = await fetch('/api/settings/branches');
      const data = await res.json();
      const names = (data.branches ?? []).map((b: { name: string }) => b.name);
      setBranches(names);
      if (names.length > 0) setForm(f => ({ ...f, branch: names[0] }));
    } catch {
      // Ignore
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/members/categories');
      const data = await res.json();
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories.map((c: { name: string }) => c.name));
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchBranches();
    fetchCategories();
  }, [fetchMembers]);

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
    fetchMembers(q, 1);
  }, [fetchMembers]);

  const handlePageChange = (page: number) => fetchMembers(search, page);

  const handleDelete = async (member: Member) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete member "${member.name}" (${member.accountNo})? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setDeletingId(member._id);
    try {
      const res = await fetch(`/api/members/${member._id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to delete member');
        return;
      }
      fetchMembers(search, pagination.page);
    } catch {
      alert('Network error while deleting member');
    } finally {
      setDeletingId(null);
    }
  };

  const handleQuickPrint = (member: Member) => {
    const printWindow = window.open('', '_blank', 'width=700,height=500');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Member Passbook Summary - ${member.accountNo}</title>
          <style>
            body { font-family: sans-serif; padding: 25px; font-size: 13px; color: #1e293b; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 15px; }
            h2 { margin: 0; color: #1e3a8a; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            td { padding: 8px 4px; border-bottom: 1px solid #e2e8f0; }
            .font-bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>SOMITY ONLINE COOPERATIVE SOCIETY</h2>
            <p>Member Official Passbook Summary Slip</p>
          </div>
          <table>
            <tr><td class="font-bold">Member Name:</td><td>${member.name}</td></tr>
            <tr><td class="font-bold">Account / ID No:</td><td>${member.accountNo}</td></tr>
            <tr><td class="font-bold">Mobile Phone:</td><td>${member.mobile}</td></tr>
            <tr><td class="font-bold">National ID (NID):</td><td>${member.nid}</td></tr>
            <tr><td class="font-bold">Membership Tier:</td><td>${member.category}</td></tr>
            <tr><td class="font-bold">Home Branch:</td><td>${member.branch}</td></tr>
            <tr><td class="font-bold">Current Savings Balance:</td><td class="font-bold">৳ ${member.totalDeposit.toLocaleString()}</td></tr>
            <tr><td class="font-bold">Account Status:</td><td>${member.status.toUpperCase()}</td></tr>
            <tr><td class="font-bold">Printed At:</td><td>${new Date().toLocaleString()}</td></tr>
          </table>
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSave = async () => {
    if (!form.name || !form.mobile || !form.nid || !form.fatherName || !form.motherName) {
      alert('Please fill all required fields (*)');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        mobile: form.mobile,
        fatherName: form.fatherName,
        motherName: form.motherName,
        nid: form.nid,
        address: form.address,
        category: form.category,
        branch: form.branch || (branches[0] || 'Main Branch'),
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : undefined,
        status: form.status,
        photo: form.photo,
        signature: form.signature,
      };

      if (form.nomineeName) {
        payload.nominee = {
          name: form.nomineeName,
          relation: form.nomineeRelation,
          nid: form.nomineeNid,
          phone: form.nomineePhone,
          percentage: Number(form.nomineePercentage) || 100,
        };
      }

      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save member');
        return;
      }
      setIsModalOpen(false);
      setForm({
        name: '', mobile: '', fatherName: '', motherName: '',
        nid: '', address: '', category: 'Cooperative Member', branch: branches[0] || '',
        dateOfBirth: '', status: 'active',
        nomineeName: '', nomineeRelation: 'Spouse', nomineeNid: '', nomineePhone: '', nomineePercentage: 100,
        photo: '', signature: '',
      });
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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-user-plus"></i>
              Register New Member
            </button>
            <button
              onClick={() => setIsBlankFormOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-file-invoice"></i>
              Print Blank Form
            </button>
            <Link
              href="/members/categories"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
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
          { header: 'Account No', accessor: 'accountNo', className: 'font-bold text-blue-600 font-mono' },
          { header: 'Member Name', accessor: 'name', className: 'font-semibold text-slate-900' },
          { header: 'Mobile Number', accessor: 'mobile', className: 'text-slate-600' },
          { header: 'NID Number', accessor: 'nid', className: 'text-slate-500 font-mono text-xs' },
          { header: 'Category', accessor: 'category', className: 'text-slate-700 font-medium' },
          { header: 'Branch', accessor: 'branch', className: 'text-slate-500' },
          {
            header: 'Total Savings',
            accessor: (item: Member) => `৳ ${item.totalDeposit.toLocaleString()}`,
            className: 'font-bold text-emerald-600',
          },
          {
            header: 'Status',
            accessor: (item: Member) => <Badge variant={item.status === 'active' ? 'success' : 'warning'}>{item.status}</Badge>,
          },
        ]}
        data={members}
        actions={(member: Member) => (
          <div className="flex items-center gap-1.5">
            {/* View */}
            <Link
              href={`/members/${member._id}`}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-600 font-bold text-xs rounded-md transition-colors flex items-center gap-1"
              title="View Profile & Other Books"
            >
              <i className="fa-solid fa-eye text-[11px]"></i>
              View
            </Link>

            {/* ID Card */}
            <button
              onClick={() => setSelectedMemberForCard(member)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-purple-50 text-purple-600 font-bold text-xs rounded-md transition-colors flex items-center gap-1"
              title="Print Biometric ID Card"
            >
              <i className="fa-solid fa-id-card text-[11px]"></i>
              ID Card
            </button>

            {/* Print Slip */}
            <button
              onClick={() => handleQuickPrint(member)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-emerald-600 font-bold text-xs rounded-md transition-colors flex items-center gap-1"
              title="Print Member Slip"
            >
              <i className="fa-solid fa-print text-[11px]"></i>
              Print
            </button>

            {/* Delete */}
            <button
              onClick={() => handleDelete(member)}
              disabled={deletingId === member._id}
              className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-md transition-colors flex items-center gap-1 disabled:opacity-50"
              title="Delete Member Profile"
            >
              <i className="fa-solid fa-trash text-[11px]"></i>
              {deletingId === member._id ? '...' : 'Delete'}
            </button>
          </div>
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

      {/* Registration Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Cooperative Society Member"
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
              {saving ? 'Registering...' : 'Save Member Profile'}
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-2">
          {/* Personal Info */}
          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 text-[11px] uppercase tracking-wide">
            1. Personal Information
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input type="text" placeholder="e.g. Md. Kabir Hossain" className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Phone *</label>
              <input type="text" placeholder="017xxxxxxxx" className={inputClass} value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Father's Name *</label>
              <input type="text" placeholder="Father's full name" className={inputClass} value={form.fatherName} onChange={e => setForm(f => ({ ...f, fatherName: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mother's Name *</label>
              <input type="text" placeholder="Mother's full name" className={inputClass} value={form.motherName} onChange={e => setForm(f => ({ ...f, motherName: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">National ID (NID) *</label>
              <input type="text" placeholder="10 or 17 digit NID" className={inputClass} value={form.nid} onChange={e => setForm(f => ({ ...f, nid: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
              <input type="date" className={inputClass} value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch *</label>
              <select className={inputClass} value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}>
                {branches.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Membership Category</label>
              <select className={inputClass} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
            <textarea rows={2} placeholder="Full village/house, post office, upazila, district" className={inputClass} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>

          {/* Nominee Details */}
          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 text-[11px] uppercase tracking-wide pt-2">
            2. Nominee Particulars
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nominee Full Name</label>
              <input type="text" placeholder="Nominee name" className={inputClass} value={form.nomineeName} onChange={e => setForm(f => ({ ...f, nomineeName: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Relation</label>
              <input type="text" placeholder="e.g. Spouse / Son / Daughter" className={inputClass} value={form.nomineeRelation} onChange={e => setForm(f => ({ ...f, nomineeRelation: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nominee NID</label>
              <input type="text" placeholder="Nominee NID number" className={inputClass} value={form.nomineeNid} onChange={e => setForm(f => ({ ...f, nomineeNid: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Share Percentage (%)</label>
              <input type="number" min={1} max={100} className={inputClass} value={form.nomineePercentage} onChange={e => setForm(f => ({ ...f, nomineePercentage: Number(e.target.value) }))} />
            </div>
          </div>

          {/* Photo & Signature */}
          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 text-[11px] uppercase tracking-wide pt-2">
            3. Biometrics & Verification
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ImageUploadBox
              label="Member Photograph"
              value={form.photo}
              onChange={val => setForm(f => ({ ...f, photo: val }))}
              aspectRatio="square"
              helperText="Upload member portrait photo."
            />
            <ImageUploadBox
              label="Specimen Signature"
              value={form.signature}
              onChange={val => setForm(f => ({ ...f, signature: val }))}
              aspectRatio="signature"
              helperText="Upload member specimen signature."
            />
          </div>
        </div>
      </Modal>

      {/* Member ID Card Modal */}
      <MemberIdCardModal
        isOpen={!!selectedMemberForCard}
        onClose={() => setSelectedMemberForCard(null)}
        member={selectedMemberForCard}
      />

      {/* Blank Registration Form Modal */}
      <BlankRegistrationFormModal
        isOpen={isBlankFormOpen}
        onClose={() => setIsBlankFormOpen(false)}
      />
    </AppLayout>
  );
}
