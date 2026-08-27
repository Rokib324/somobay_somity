'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { mockAccountHeads } from '@/data/mockData';
import Link from 'next/link';

export default function AccountsOverviewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AppLayout>
      <PageHeader
        title="Accounts & Financial Ledger"
        subtitle="Manage chart of accounts, general ledger, financial statements, and voucher journal entries."
        breadcrumbs={[{ label: 'Accounts' }]}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              New Account Head
            </button>
            <Link
              href="/accounts/payment"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-money-bill-transfer"></i>
              Voucher Entry
            </Link>
          </div>
        }
      />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <Link href="/accounts/chart-of-accounts" className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-center group">
          <i className="fa-solid fa-sitemap text-blue-600 text-lg mb-1 block group-hover:scale-110 transition-transform"></i>
          <span className="text-xs font-bold text-slate-700 block">Chart of Accounts</span>
        </Link>
        <Link href="/accounts/general-ledger" className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-center group">
          <i className="fa-solid fa-book-bookmark text-emerald-600 text-lg mb-1 block group-hover:scale-110 transition-transform"></i>
          <span className="text-xs font-bold text-slate-700 block">General Ledger</span>
        </Link>
        <Link href="/accounts/trial-balance" className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-center group">
          <i className="fa-solid fa-scale-balanced text-amber-600 text-lg mb-1 block group-hover:scale-110 transition-transform"></i>
          <span className="text-xs font-bold text-slate-700 block">Trial Balance</span>
        </Link>
        <Link href="/accounts/profit-loss" className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-center group">
          <i className="fa-solid fa-chart-pie text-purple-600 text-lg mb-1 block group-hover:scale-110 transition-transform"></i>
          <span className="text-xs font-bold text-slate-700 block">Profit & Loss</span>
        </Link>
        <Link href="/accounts/income-statement" className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-center group">
          <i className="fa-solid fa-file-contract text-indigo-600 text-lg mb-1 block group-hover:scale-110 transition-transform"></i>
          <span className="text-xs font-bold text-slate-700 block">Income Statement</span>
        </Link>
        <Link href="/accounts/cost-center" className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-center group">
          <i className="fa-solid fa-building-columns text-rose-600 text-lg mb-1 block group-hover:scale-110 transition-transform"></i>
          <span className="text-xs font-bold text-slate-700 block">Cost Center</span>
        </Link>
      </div>

      {/* Account Heads Data Table */}
      <DataTable
        searchPlaceholder="Search Account Code or Head Name..."
        columns={[
          { header: 'Code', accessor: 'code', className: 'font-bold text-blue-600' },
          { header: 'Account Head Name', accessor: 'name', className: 'font-semibold text-slate-800' },
          {
            header: 'Group Type',
            accessor: (item) => <Badge variant={item.group === 'Asset' ? 'info' : item.group === 'Expense' ? 'danger' : 'success'}>{item.group}</Badge>,
          },
          { header: 'Parent Code', accessor: (item) => item.parentCode || '—', className: 'text-slate-400 font-mono text-xs' },
          { header: 'Current Balance', accessor: (item) => `৳ ${item.balance.toLocaleString()}`, className: 'font-bold text-slate-900' },
          { header: 'Status', accessor: (item) => <Badge variant="success">{item.status}</Badge> },
        ]}
        data={mockAccountHeads}
      />

      {/* Add New Account Head Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Account Head"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg text-xs hover:bg-slate-200">
              Cancel
            </button>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-xs hover:bg-blue-700">
              Save Account Head
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Account Code</label>
            <input type="text" placeholder="e.g. 1025" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Account Head Name</label>
            <input type="text" placeholder="e.g. Office Equipment Asset" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Group</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500">
                <option>Asset</option>
                <option>Liability</option>
                <option>Equity</option>
                <option>Income</option>
                <option>Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Type</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500">
                <option>Header</option>
                <option>Sub-Ledger</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
