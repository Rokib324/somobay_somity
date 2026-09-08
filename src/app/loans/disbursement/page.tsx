'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';

interface LoanAccount {
  _id: string;
  loanNo: string;
  memberName: string;
  productName: string;
  principalAmount: number;
  interestRate: number;
  installments: number;
  installmentType: string;
  branch: string;
  applicationDate: string;
  status: string;
}

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'success' | 'danger'> = {
  approved: 'info',
  pending_approval: 'warning',
};

export default function LoanDisbursementPage() {
  const [loans, setLoans] = useState<LoanAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [disbursedBy, setDisbursedBy] = useState('Admin');

  const fetchReady = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/loans/disbursement?status=approved');
      const data = await res.json();
      setLoans(data.loans ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReady(); }, [fetchReady]);

  const handleDisburse = async (loanId: string) => {
    if (!confirm('Confirm loan disbursement? This will mark the loan as active.')) return;
    setProcessing(loanId);
    try {
      const res = await fetch('/api/loans/disbursement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId, disbursedBy }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Disbursement failed');
        return;
      }
      alert('Loan disbursed successfully! Voucher posted.');
      fetchReady();
    } finally {
      setProcessing(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Loan Disbursement Entry"
        subtitle="Process approved loan payouts to member accounts. Only approved loans appear here."
        breadcrumbs={[{ label: 'Loans', href: '/loans' }, { label: 'Disbursement' }]}
        action={
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">Disbursed By:</label>
            <input
              type="text"
              value={disbursedBy}
              onChange={e => setDisbursedBy(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold w-40"
            />
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-blue-700">{loans.length}</p>
          <p className="text-xs font-semibold text-blue-600 mt-1">Ready to Disburse</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
          <p className="text-xl font-black text-emerald-700">
            ৳ {loans.reduce((s, l) => s + l.principalAmount, 0).toLocaleString()}
          </p>
          <p className="text-xs font-semibold text-emerald-600 mt-1">Total Sanction Amount</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-amber-700">
            {loans.filter(l => l.status === 'approved').length}
          </p>
          <p className="text-xs font-semibold text-amber-600 mt-1">Approved Loans</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
          {loans.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <i className="fa-solid fa-hand-holding-dollar text-3xl text-slate-300 mb-3 block" />
              <p className="font-semibold">No approved loans awaiting disbursement</p>
              <p className="text-xs mt-1">Go to Approvals page to approve pending loans first</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Loan No</th>
                    <th className="py-3 px-4">Borrower</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Principal (৳)</th>
                    <th className="py-3 px-4">Rate</th>
                    <th className="py-3 px-4">Installments</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map((loan) => (
                    <tr key={loan._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-blue-600">{loan.loanNo}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{loan.memberName}</td>
                      <td className="py-3.5 px-4 text-slate-600">{loan.productName}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900">৳ {loan.principalAmount.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-semibold">{loan.interestRate}%</td>
                      <td className="py-3.5 px-4 text-slate-500">{loan.installments} × {loan.installmentType}</td>
                      <td className="py-3.5 px-4 text-slate-500">{loan.branch}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={STATUS_COLORS[loan.status] ?? 'info'}>
                          {loan.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDisburse(loan._id)}
                          disabled={processing === loan._id}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] disabled:opacity-50 transition-colors shadow-sm"
                        >
                          {processing === loan._id ? 'Processing...' : 'Disburse Now'}
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
