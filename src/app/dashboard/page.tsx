'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { mockMembers, mockDeposits, mockLoans, mockSMSHistory } from '@/data/mockData';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Dashboard Overview"
        subtitle="Real-time summary of cooperative operations, financial performance, and collections."
        action={
          <div className="flex gap-2">
            <Link
              href="/savings/collections"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-cash-register"></i>
              Daily Collection Sheet
            </Link>
            <Link
              href="/accounts/payment"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-receipt"></i>
              New Voucher
            </Link>
          </div>
        }
      />

      {/* Metrics Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Active Members"
          value="2,960"
          iconClass="fa-solid fa-users"
          change="+12% this month"
          trend="up"
          color="blue"
        />
        <StatCard
          title="Total Savings Deposit"
          value="৳ 1,89,50,000"
          iconClass="fa-solid fa-vault"
          change="+8.5% growth"
          trend="up"
          color="emerald"
        />
        <StatCard
          title="Active Outstanding Loans"
          value="৳ 1,42,80,000"
          iconClass="fa-solid fa-hand-holding-dollar"
          change="-3.2% recovery"
          trend="down"
          color="amber"
        />
        <StatCard
          title="Net Cash in Hand"
          value="৳ 12,45,000"
          iconClass="fa-solid fa-wallet"
          change="+15.4% balance"
          trend="up"
          color="indigo"
        />
      </div>

      {/* Main Content Grid: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column: Recent Member Registrations & Loans */}
        <div className="lg:col-span-2 space-y-6">
          {/* Member Overview Table */}
          <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <i className="fa-solid fa-user-plus text-blue-600"></i>
                Recent Member Registrations
              </h3>
              <Link href="/members" className="text-xs text-blue-600 hover:underline font-semibold">
                View All Members →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Account No</th>
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Total Deposit</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-blue-600">{member.accountNo}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{member.name}</td>
                      <td className="py-3 px-4 text-slate-500">{member.branch}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">৳ {member.totalDeposit.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge variant={member.status === 'active' ? 'success' : 'warning'}>
                          {member.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Loans Overview */}
          <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <i className="fa-solid fa-handshake text-emerald-600"></i>
                Active Loan Disbursements
              </h3>
              <Link href="/loans" className="text-xs text-blue-600 hover:underline font-semibold">
                Loan Center →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Loan No</th>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Disbursed</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Due Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-700">{loan.loanNo}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{loan.memberName}</td>
                      <td className="py-3 px-4 text-slate-500">{loan.productName}</td>
                      <td className="py-3 px-4 font-medium">৳ {loan.principalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 font-medium text-emerald-600">৳ {loan.paidAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-rose-600">৳ {loan.dueAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Navigation & SMS Feed */}
        <div className="space-y-6">
          {/* Module Quick Access Shortcuts */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <i className="fa-solid fa-grid-2 text-indigo-600"></i>
              Quick Module Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/accounts"
                className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg text-center transition-all group"
              >
                <i className="fa-solid fa-scale-balanced text-xl text-blue-600 group-hover:scale-110 transition-transform mb-1 block"></i>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">Accounts</span>
              </Link>
              <Link
                href="/savings/deposits"
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-lg text-center transition-all group"
              >
                <i className="fa-solid fa-piggy-bank text-xl text-emerald-600 group-hover:scale-110 transition-transform mb-1 block"></i>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700">Savings</span>
              </Link>
              <Link
                href="/loans"
                className="p-3 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-lg text-center transition-all group"
              >
                <i className="fa-solid fa-hand-holding-dollar text-xl text-amber-600 group-hover:scale-110 transition-transform mb-1 block"></i>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-amber-700">Loans</span>
              </Link>
              <Link
                href="/hr/employees"
                className="p-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-lg text-center transition-all group"
              >
                <i className="fa-solid fa-user-gear text-xl text-purple-600 group-hover:scale-110 transition-transform mb-1 block"></i>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-purple-700">HR & Staff</span>
              </Link>
            </div>
          </div>

          {/* SMS Notification Feed */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <i className="fa-solid fa-comment-sms text-blue-600"></i>
                System SMS Alerts
              </h3>
              <Link href="/sms/history" className="text-xs text-blue-600 hover:underline font-semibold">
                Logs →
              </Link>
            </div>
            <div className="space-y-3">
              {mockSMSHistory.map((sms) => (
                <div key={sms.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{sms.recipient}</span>
                    <span className="text-[10px] text-slate-400">{sms.sentAt}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">{sms.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
