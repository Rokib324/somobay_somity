'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';

interface DueLoan {
  _id: string;
  loanNo: string;
  memberName: string;
  principalAmount: number;
  dueAmount: number;
  paidAmount: number;
  disbursementDate: string;
  branch: string;
  status: string;
}

export default function DueCollectionPage() {
  const [dueLoans, setDueLoans] = useState<DueLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingSms, setSendingSms] = useState<string | null>(null);

  const fetchDues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/collections/due');
      const data = await res.json();
      setDueLoans(data.dueLoans ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDues(); }, [fetchDues]);

  const sendWarning = async (loan: DueLoan) => {
    setSendingSms(loan._id);
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: loan.memberName,
          phone: '01700000000', // placeholder
          message: `Dear ${loan.memberName}, your loan ${loan.loanNo} has an outstanding due of ৳${loan.dueAmount.toLocaleString()}. Please make payment immediately to avoid penalty. - Somity ERP`,
          type: 'Notification',
        }),
      });
      if (res.ok) {
        alert('Warning SMS sent to ' + loan.memberName);
      } else {
        alert('Failed to send SMS');
      }
    } finally {
      setSendingSms(null);
    }
  };

  const getDaysOverdue = (disbursementDate: string) => {
    const disbursed = new Date(disbursementDate);
    const today = new Date();
    return Math.floor((today.getTime() - disbursed.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <AppLayout>
      <PageHeader
        title="Overdue Loan Recovery List"
        subtitle="Track defaulting loan accounts and overdue installment recovery progress."
        breadcrumbs={[{ label: 'Collections', href: '/collections' }, { label: 'Overdue List' }]}
        action={
          <button
            onClick={fetchDues}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <i className="fa-solid fa-rotate mr-1.5" />Refresh
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-rose-700">{dueLoans.length}</p>
          <p className="text-xs font-semibold text-rose-600 mt-1">Overdue Accounts</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
          <p className="text-xl font-black text-amber-700">
            ৳ {dueLoans.reduce((s, l) => s + l.dueAmount, 0).toLocaleString()}
          </p>
          <p className="text-xs font-semibold text-amber-600 mt-1">Total Due Amount</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
          <p className="text-xl font-black text-slate-700">
            ৳ {dueLoans.reduce((s, l) => s + l.paidAmount, 0).toLocaleString()}
          </p>
          <p className="text-xs font-semibold text-slate-600 mt-1">Total Recovered</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
          {dueLoans.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <i className="fa-solid fa-circle-check text-3xl text-emerald-400 mb-3 block" />
              <p className="font-semibold">No overdue loans found</p>
              <p className="text-xs mt-1">All active loans are within their payment schedule</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-rose-50 border-b border-rose-100 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Loan No</th>
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4 text-right">Principal (৳)</th>
                    <th className="py-3 px-4 text-right">Paid (৳)</th>
                    <th className="py-3 px-4 text-right">Due (৳)</th>
                    <th className="py-3 px-4 text-center">Days</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dueLoans.map((loan) => {
                    const days = getDaysOverdue(loan.disbursementDate);
                    return (
                      <tr key={loan._id} className="hover:bg-rose-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-rose-600">{loan.loanNo}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{loan.memberName}</td>
                        <td className="py-3.5 px-4 text-slate-500">{loan.branch}</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-700">৳ {loan.principalAmount.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">৳ {loan.paidAmount.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right font-black text-rose-700">৳ {loan.dueAmount.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${days > 60 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                            {days}d
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="danger">{loan.status}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => sendWarning(loan)}
                            disabled={sendingSms === loan._id}
                            className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-[11px] hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            {sendingSms === loan._id ? 'Sending...' : 'Send SMS'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
