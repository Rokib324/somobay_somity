'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import Link from 'next/link';

export default function ReportsCenterPage() {
  const reportCards = [
    { title: 'General Ledger Book', desc: 'Chronological list of all journal voucher entries.', href: '/accounts/general-ledger', icon: 'fa-book-bookmark', color: 'blue' },
    { title: 'Trial Balance Statement', desc: 'Balanced summary of debit and credit ledgers.', href: '/accounts/trial-balance', icon: 'fa-scale-balanced', color: 'emerald' },
    { title: 'Profit & Loss Statement', desc: 'Operating revenue vs expense statement.', href: '/accounts/profit-loss', icon: 'fa-chart-pie', color: 'purple' },
    { title: 'Income Statement', desc: 'Detailed comprehensive income statement.', href: '/accounts/income-statement', icon: 'fa-file-contract', color: 'indigo' },
    { title: 'Sub-Ledger Analysis', desc: 'Individual member and vendor sub-ledger report.', href: '/accounts/sub-ledger-report', icon: 'fa-table-list', color: 'amber' },
    { title: 'Monthly Attendance Matrix', desc: 'Staff attendance and leave summary for payroll.', href: '/hr/attendance/monthly', icon: 'fa-calendar-days', color: 'rose' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Centralized ERP Financial & Operations Reports"
        subtitle="Generate, print, and export accounting statements, loan collection sheets, and audit reports."
        breadcrumbs={[{ label: 'Reports' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((r, idx) => (
          <Link key={idx} href={r.href} className="bg-white rounded-xl border border-slate-200 p-6 card-shadow hover:border-blue-500 hover:shadow-lg transition-all group block">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                <i className={`fa-solid ${r.icon}`}></i>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{r.title}</h3>
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Generate PDF / Print →</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
