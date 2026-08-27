'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { mockLoans } from '@/data/mockData';
import Link from 'next/link';

export default function LoansOverviewPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Loan Management & Portfolio"
        subtitle="Manage loan applications, approvals, disbursements, schedules, and active balances."
        breadcrumbs={[{ label: 'Loans' }]}
        action={
          <div className="flex gap-2">
            <Link
              href="/loans/disbursement"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-file-signature"></i>
              Disburse Loan
            </Link>
            <Link
              href="/loans/approvals"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-[#check-to-slot]"></i>
              Loan Approvals
            </Link>
          </div>
        }
      />

      <DataTable
        searchPlaceholder="Search Loan No, Member Name, or Product..."
        columns={[
          { header: 'Loan No', accessor: 'loanNo', className: 'font-bold text-blue-600' },
          { header: 'Borrower Member', accessor: 'memberName', className: 'font-semibold text-slate-900' },
          { header: 'Loan Product', accessor: 'productName', className: 'text-slate-600' },
          { header: 'Principal (৳)', accessor: (item) => `৳ ${item.principalAmount.toLocaleString()}`, className: 'font-bold text-slate-800' },
          { header: 'Paid Principal', accessor: (item) => `৳ ${item.paidAmount.toLocaleString()}`, className: 'font-semibold text-emerald-600' },
          { header: 'Outstanding Due', accessor: (item) => `৳ ${item.dueAmount.toLocaleString()}`, className: 'font-bold text-rose-600' },
          {
            header: 'Status',
            accessor: (item) => <Badge variant={item.status === 'active' ? 'success' : 'warning'}>{item.status}</Badge>,
          },
        ]}
        data={mockLoans}
        actions={(loan) => (
          <Link
            href="/loans/schedules"
            className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-blue-600 font-bold text-xs rounded-lg transition-colors inline-block"
          >
            Repayment Schedule
          </Link>
        )}
      />
    </AppLayout>
  );
}
