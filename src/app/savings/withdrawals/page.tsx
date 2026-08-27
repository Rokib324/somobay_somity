'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function WithdrawalListPage() {
  const withdrawals = [
    { id: 'W-901', accountNo: 'AC-1001', member: 'Md. Al-Amin Khan', amount: 15000, date: '2026-08-20', status: 'Approved', processedBy: 'Tariqul Islam' },
    { id: 'W-902', accountNo: 'AC-1003', member: 'Habibur Rahman', amount: 50000, date: '2026-08-22', status: 'Pending Approval', processedBy: 'Farhana Yeasmin' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Savings Withdrawal Applications & History"
        subtitle="Manage member savings withdrawal requests, manager approvals, and cash payout receipts."
        breadcrumbs={[{ label: 'Savings', href: '/savings/deposits' }, { label: 'Withdrawals' }]}
        action={
          <Link
            href="/savings/withdrawals/apply"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <i className="fa-solid fa-hand-holding-hand"></i>
            Apply New Withdrawal
          </Link>
        }
      />

      <DataTable
        searchPlaceholder="Search Withdrawal ID, Account No, or Member..."
        columns={[
          { header: 'Withdrawal ID', accessor: 'id', className: 'font-bold text-blue-600' },
          { header: 'Account No', accessor: 'accountNo', className: 'font-mono text-slate-700' },
          { header: 'Member Name', accessor: 'member', className: 'font-semibold text-slate-900' },
          { header: 'Amount (৳)', accessor: (item) => `৳ ${item.amount.toLocaleString()}`, className: 'font-bold text-rose-600' },
          { header: 'Date', accessor: 'date', className: 'text-slate-500' },
          {
            header: 'Status',
            accessor: (item) => <Badge variant={item.status === 'Approved' ? 'success' : 'warning'}>{item.status}</Badge>,
          },
          { header: 'Approved By', accessor: 'processedBy', className: 'text-slate-600 font-medium' },
        ]}
        data={withdrawals}
      />
    </AppLayout>
  );
}
