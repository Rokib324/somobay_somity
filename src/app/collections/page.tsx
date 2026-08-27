'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function CollectionsOverviewPage() {
  const collections = [
    { id: 'COL-501', member: 'Nasrin Akhter (AC-1002)', date: '2026-08-23', type: 'Loan Installment', amount: 5000, officer: 'Mahmuda Begum', status: 'Posted' },
    { id: 'COL-502', member: 'Md. Al-Amin Khan (AC-1001)', date: '2026-08-23', type: 'Daily Savings', amount: 500, officer: 'Mahmuda Begum', status: 'Posted' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Field Collections Management"
        subtitle="Manage daily, due, advance, and officer collection sheets."
        breadcrumbs={[{ label: 'Collections' }]}
        action={
          <div className="flex gap-2">
            <Link
              href="/collections/daily"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-list-check"></i>
              Daily Field Sheet
            </Link>
            <Link
              href="/collections/due"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-triangle-exclamation"></i>
              Due Recovery List
            </Link>
          </div>
        }
      />

      <DataTable
        searchPlaceholder="Search Collection ID or Member..."
        columns={[
          { header: 'Collection ID', accessor: 'id', className: 'font-bold text-blue-600' },
          { header: 'Member Name', accessor: 'member', className: 'font-semibold text-slate-800' },
          { header: 'Collection Type', accessor: 'type', className: 'text-slate-600 font-medium' },
          { header: 'Collected Amount', accessor: (item) => `৳ ${item.amount.toLocaleString()}`, className: 'font-bold text-emerald-600' },
          { header: 'Field Officer', accessor: 'officer', className: 'text-slate-500' },
          { header: 'Posting Status', accessor: (item) => <Badge variant="success">{item.status}</Badge> },
        ]}
        data={collections}
      />
    </AppLayout>
  );
}
