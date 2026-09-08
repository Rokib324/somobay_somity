'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface LeaveApplication {
  _id: string;
  empId: string;
  empName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  branch: string;
  createdAt: string;
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
};

export default function LeaveApplicationsListPage() {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hr/leave?limit=50');
      const data = await res.json();
      setApplications(data.leaves ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    if (!confirm(`${action === 'approved' ? 'Approve' : 'Reject'} this leave application?`)) return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/hr/leave/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });
      if (!res.ok) {
        alert('Failed to update leave status');
        return;
      }
      fetchLeaves();
    } finally {
      setProcessing(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Staff Leave Applications"
        subtitle="Review casual, sick, and annual leave applications for employees."
        breadcrumbs={[{ label: 'HR', href: '/hr/employees' }, { label: 'Leave' }]}
        action={
          <Link
            href="/hr/leave/apply"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <i className="fa-solid fa-plus mr-1.5" />Apply for Leave
          </Link>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-amber-700">{applications.filter(a => a.status === 'pending').length}</p>
          <p className="text-xs font-semibold text-amber-600 mt-1">Pending</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-emerald-700">{applications.filter(a => a.status === 'approved').length}</p>
          <p className="text-xs font-semibold text-emerald-600 mt-1">Approved</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-rose-700">{applications.filter(a => a.status === 'rejected').length}</p>
          <p className="text-xs font-semibold text-rose-600 mt-1">Rejected</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
          {applications.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <i className="fa-solid fa-calendar-check text-3xl text-slate-300 mb-3 block" />
              <p className="font-semibold">No leave applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Date Range</th>
                    <th className="py-3 px-4 text-center">Days</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Applied</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map(app => (
                    <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{app.empName}</p>
                        <p className="text-slate-400 text-[10px]">{app.empId}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{app.leaveType}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(app.fromDate).toLocaleDateString('en-BD')} → {new Date(app.toDate).toLocaleDateString('en-BD')}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900">{app.totalDays}</td>
                      <td className="py-3.5 px-4 text-slate-500">{app.branch}</td>
                      <td className="py-3.5 px-4 text-slate-400">{new Date(app.createdAt).toLocaleDateString('en-BD')}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={STATUS_VARIANT[app.status] ?? 'warning'}>{app.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {app.status === 'pending' ? (
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => handleAction(app._id, 'approved')}
                              disabled={processing === app._id}
                              className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[11px] hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(app._id, 'rejected')}
                              disabled={processing === app._id}
                              className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg text-[11px] hover:bg-rose-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
