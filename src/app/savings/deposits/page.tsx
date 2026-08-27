'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { mockDeposits } from '@/data/mockData';
import Link from 'next/link';

export default function SavingsDepositsPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Member Savings Accounts & Deposits"
        subtitle="Manage daily savings, monthly DPS schemes, fixed deposits (FDR), and interest calculations."
        breadcrumbs={[{ label: 'Savings', href: '/savings/deposits' }, { label: 'Accounts' }]}
        action={
          <div className="flex gap-2">
            <Link
              href="/savings/create"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              Open Savings Account
            </Link>
            <Link
              href="/savings/collections"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-cash-register"></i>
              Post Savings Collection
            </Link>
          </div>
        }
      />

      <DataTable
        searchPlaceholder="Search Deposit Account No or Member Name..."
        columns={[
          { header: 'Account No', accessor: 'accountNo', className: 'font-bold text-blue-600' },
          { header: 'Member Name', accessor: 'memberName', className: 'font-semibold text-slate-800' },
          { header: 'Savings Scheme Type', accessor: 'type', className: 'text-slate-700 font-medium' },
          { header: 'Installment / Amount', accessor: (item) => `৳ ${item.amount.toLocaleString()}`, className: 'text-slate-700' },
          { header: 'Interest Rate', accessor: (item) => `${item.interestRate}%`, className: 'font-semibold text-blue-600' },
          { header: 'Current Balance', accessor: (item) => `৳ ${item.balance.toLocaleString()}`, className: 'font-bold text-emerald-600' },
          {
            header: 'Status',
            accessor: (item) => <Badge variant={item.status === 'active' ? 'success' : 'neutral'}>{item.status}</Badge>,
          },
        ]}
        data={mockDeposits}
      />
    </AppLayout>
  );
}
