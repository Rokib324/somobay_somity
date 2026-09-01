'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface DashboardStats {
  members: { total: number; active: number; pending: number };
  savings: { totalBalance: number };
  loans: { totalOutstanding: number; activeCount: number; overdueCount: number };
  todayCollection: number;
  employees: { active: number };
  recentCollections: Array<{ _id: string; memberName: string; amount: number; type: string; date: string; accountNo: string }>;
  recentSMS: Array<{ _id: string; recipient: string; message: string; status: string; sentAt: string; type: string }>;
}

function formatCurrency(amount: number) {
  return `৳ ${amount.toLocaleString('en-BD')}`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Auto-seed on first visit if DB is empty
        const seedCheck = await fetch('/api/seed');
        const { seeded } = await seedCheck.json();
        if (!seeded) {
          setSeeding(true);
          await fetch('/api/seed', { method: 'POST' });
          setSeeding(false);
        }

        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || seeding) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">
            {seeding ? 'Seeding database with demo data...' : 'Loading dashboard...'}
          </p>
        </div>
      </AppLayout>
    );
  }

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
          value={stats?.members.active.toLocaleString() ?? '0'}
          iconClass="fa-solid fa-users"
          change={`${stats?.members.pending ?? 0} pending approval`}
          trend="up"
          color="blue"
        />
        <StatCard
          title="Total Savings Deposit"
          value={formatCurrency(stats?.savings.totalBalance ?? 0)}
          iconClass="fa-solid fa-vault"
          change="Live balance across all accounts"
          trend="up"
          color="emerald"
        />
        <StatCard
          title="Active Outstanding Loans"
          value={formatCurrency(stats?.loans.totalOutstanding ?? 0)}
          iconClass="fa-solid fa-hand-holding-dollar"
          change={`${stats?.loans.overdueCount ?? 0} overdue accounts`}
          trend="down"
          color="amber"
        />
        <StatCard
          title="Today's Collection"
          value={formatCurrency(stats?.todayCollection ?? 0)}
          iconClass="fa-solid fa-wallet"
          change="Savings + Loan installments"
          trend="up"
          color="indigo"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Collections */}
          <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <i className="fa-solid fa-arrow-trend-up text-blue-600"></i>
                Recent Collections
              </h3>
              <Link href="/collections/daily" className="text-xs text-blue-600 hover:underline font-semibold">
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Account</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(stats?.recentCollections ?? []).map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">{c.memberName}</td>
                      <td className="py-3 px-4 font-bold text-blue-600">{c.accountNo}</td>
                      <td className="py-3 px-4">
                        <Badge variant={c.type === 'savings' ? 'success' : 'info'}>
                          {c.type.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{formatCurrency(c.amount)}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(c.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {!stats?.recentCollections?.length && (
                    <tr><td colSpan={5} className="py-6 text-center text-slate-400">No collections yet today</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-blue-700">{stats?.members.total ?? 0}</div>
              <div className="text-xs font-semibold text-blue-600 mt-1">Total Members</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-emerald-700">{stats?.loans.activeCount ?? 0}</div>
              <div className="text-xs font-semibold text-emerald-600 mt-1">Active Loans</div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-purple-700">{stats?.employees.active ?? 0}</div>
              <div className="text-xs font-semibold text-purple-600 mt-1">Active Staff</div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Module Shortcuts */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <i className="fa-solid fa-grid-2 text-indigo-600"></i>
              Quick Module Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/accounts', icon: 'fa-scale-balanced', label: 'Accounts', color: 'blue' },
                { href: '/savings/deposits', icon: 'fa-piggy-bank', label: 'Savings', color: 'emerald' },
                { href: '/loans', icon: 'fa-hand-holding-dollar', label: 'Loans', color: 'amber' },
                { href: '/hr/employees', icon: 'fa-user-gear', label: 'HR & Staff', color: 'purple' },
                { href: '/members', icon: 'fa-users', label: 'Members', color: 'indigo' },
                { href: '/sms/send', icon: 'fa-comment-sms', label: 'SMS', color: 'rose' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-3 bg-slate-50 hover:bg-${item.color}-50 border border-slate-200 hover:border-${item.color}-200 rounded-lg text-center transition-all group`}
                >
                  <i className={`fa-solid ${item.icon} text-xl text-${item.color}-600 group-hover:scale-110 transition-transform mb-1 block`}></i>
                  <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent SMS Alerts */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <i className="fa-solid fa-comment-sms text-blue-600"></i>
                Recent SMS Alerts
              </h3>
              <Link href="/sms/history" className="text-xs text-blue-600 hover:underline font-semibold">
                Logs →
              </Link>
            </div>
            <div className="space-y-3">
              {(stats?.recentSMS ?? []).map((sms) => (
                <div key={sms._id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{sms.recipient}</span>
                    <Badge variant={sms.status === 'Delivered' ? 'success' : 'danger'}>{sms.status}</Badge>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">{sms.message}</p>
                </div>
              ))}
              {!stats?.recentSMS?.length && (
                <p className="text-xs text-slate-400 text-center py-4">No recent SMS</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
