'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { mockMembers } from '@/data/mockData';
import Link from 'next/link';

export default function MembersListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        columns={[
          { header: 'Account No', accessor: 'accountNo', className: 'font-bold text-blue-600' },
          { header: 'Member Name', accessor: 'name', className: 'font-semibold text-slate-900' },
          { header: 'Mobile Number', accessor: 'mobile', className: 'text-slate-600' },
          { header: 'NID Number', accessor: 'nid', className: 'text-slate-500 font-mono text-xs' },
          { header: 'Category', accessor: 'category', className: 'text-slate-700 font-medium' },
          { header: 'Branch', accessor: 'branch', className: 'text-slate-500' },
          { header: 'Total Savings', accessor: (item) => `৳ ${item.totalDeposit.toLocaleString()}`, className: 'font-bold text-emerald-600' },
          {
            header: 'Status',
            accessor: (item) => <Badge variant={item.status === 'active' ? 'success' : 'warning'}>{item.status}</Badge>,
          },
        ]}
        data={mockMembers}
        actions={(member) => (
          <Link
            href={`/members/${member.id}`}
            className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-bold text-xs rounded-lg transition-colors inline-block"
          >
            View Details
          </Link>
        )}
      />

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
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-xs hover:bg-blue-700">
              Save Member Profile
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input type="text" placeholder="Member full name" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
              <input type="text" placeholder="017xxxxxxxx" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Father's Name</label>
              <input type="text" placeholder="Father name" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mother's Name</label>
              <input type="text" placeholder="Mother name" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">NID Card No</label>
              <input type="text" placeholder="National ID" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Branch</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                <option>Main Branch (Dhaka)</option>
                <option>Uttara Branch</option>
                <option>Gulshan Branch</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
