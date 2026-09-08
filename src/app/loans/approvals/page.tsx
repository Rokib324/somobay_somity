'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';

interface LoanApplication {
  _id: string;
  loanNo: string;
  memberName: string;
  productName: string;
  principalAmount: number;
  interestRate: number;
  installments: number;
  installmentType: string;
  purpose?: string;
  branch: string;
  applicationDate: string;
  status: string;
}

export default function LoanApprovalsPage() {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/loans?status=pending_approval&limit=50');
      const data = await res.json();
      setLoans(data.loans ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${action === 'approved' ? 'approve' : 'reject'} this loan?`)) return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/loans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          approvedBy: 'Manager',
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Action failed');
        return;
      }
      await fetchPending();
    } finally {
      setProcessing(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Loan Application Approvals Queue"
        subtitle="Review, approve, or reject member loan applications pending manager authorization."
        breadcrumbs={[{ label: 'Loans', href: '/loans' }, { label: 'Approvals' }]}
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-amber-700">{loans.filter(l => l.status === 'pending_approval').length}</p>
          <p className="text-xs font-semibold text-amber-600 mt-1">Pending Approval</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-blue-700">{loans.reduce((s, l) => s + l.principalAmount, 0).toLocaleString()}</p>
          <p className="text-xs font-semibold text-blue-600 mt-1">Total Requested (৳)</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-slate-700">{loans.length}</p>
          <p className="text-xs font-semibold text-slate-600 mt-1">Total Applications</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
          {loans.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <i className="fa-solid fa-check-circle text-3xl text-emerald-400 mb-3 block" />
              <p className="font-semibold">No pending loan applications</p>
              <p className="text-xs mt-1">All applications have been processed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Loan No</th>
                    <th className="py-3 px-4">Applicant Member</th>
                    <th className="py-3 px-4">Product Scheme</th>
                    <th className="py-3 px-4">Amount (৳)</th>
                    <th className="py-3 px-4">Rate / Terms</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Applied Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map((loan) => (
                    <tr key={loan._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-blue-600">{loan.loanNo}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{loan.memberName}</td>
                      <td className="py-3.5 px-4 text-slate-600">{loan.productName}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900">৳ {loan.principalAmount.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-slate-500">{loan.interestRate}% / {loan.installments} {loan.installmentType}</td>
                      <td className="py-3.5 px-4 text-slate-500">{loan.branch}</td>
                      <td className="py-3.5 px-4 text-slate-400">{new Date(loan.applicationDate).toLocaleDateString('en-BD')}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="warning">Pending Approval</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleAction(loan._id, 'approved')}
                          disabled={processing === loan._id}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors text-[11px]"
                        >
                          {processing === loan._id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleAction(loan._id, 'rejected')}
                          disabled={processing === loan._id}
                          className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors text-[11px]"
                        >
                          {processing === loan._id ? '...' : 'Reject'}
                        </button>
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
