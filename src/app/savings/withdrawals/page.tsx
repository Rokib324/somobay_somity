'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface WithdrawalRecord {
  _id: string;
  requestNo: string;
  memberName: string;
  memberAccountNo: string;
  accountNo: string;
  schemeType: string;
  amount: number;
  availableBalance: number;
  reason: string;
  appliedBy: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  rejectionReason?: string;
}

export default function WithdrawalListPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [stats, setStats] = useState({ pendingCount: 0, approvedCount: 0, rejectedCount: 0 });

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/savings/withdrawals');
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
      if (data.stats) setStats(data.stats);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (requestId: string, action: 'Approve' | 'Reject') => {
    let rejectionReason = '';
    if (action === 'Reject') {
      const promptRes = window.prompt('Please enter reason for rejecting this withdrawal:');
      if (promptRes === null) return;
      rejectionReason = promptRes || 'Rejected by management';
    } else {
      const confirmApprove = window.confirm('Approve this withdrawal? This will immediately deduct funds from the member account and record cash disbursement.');
      if (!confirmApprove) return;
    }

    setProcessingId(requestId);
    try {
      const res = await fetch('/api/savings/withdrawals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action,
          reviewerName: 'Operations In-Charge',
          rejectionReason,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || `Failed to ${action.toLowerCase()} withdrawal`);
        return;
      }

      alert(`Withdrawal ${action.toLowerCase()}d successfully!`);
      fetchWithdrawals();
    } catch {
      alert('Network error while processing request');
    } finally {
      setProcessingId(null);
    }
  };

  const handlePrintVoucher = (w: WithdrawalRecord) => {
    const printWindow = window.open('', '_blank', 'width=700,height=500');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Withdrawal Payment Voucher - ${w.requestNo}</title>
          <style>
            body { font-family: sans-serif; padding: 25px; font-size: 13px; color: #1e293b; }
            .header { border-bottom: 2px solid #e11d48; padding-bottom: 10px; margin-bottom: 15px; }
            h2 { margin: 0; color: #9f1239; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            td { padding: 8px 4px; border-bottom: 1px solid #e2e8f0; }
            .font-bold { font-weight: bold; }
            .sig-row { display: flex; justify-content: space-between; margin-top: 50px; }
            .sig-line { border-top: 1px solid #475569; width: 140px; text-align: center; padding-top: 4px; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>SOMITY ONLINE COOPERATIVE SOCIETY</h2>
            <p>Official Savings Withdrawal Payment Debit Voucher</p>
          </div>
          <table>
            <tr><td class="font-bold">Voucher / Requisition No:</td><td class="font-bold">${w.requestNo}</td></tr>
            <tr><td class="font-bold">Member Name:</td><td>${w.memberName}</td></tr>
            <tr><td class="font-bold">Member ID / Account:</td><td>${w.memberAccountNo}</td></tr>
            <tr><td class="font-bold">Savings Account Book:</td><td>${w.accountNo} (${w.schemeType})</td></tr>
            <tr><td class="font-bold">Amount Withdrawn:</td><td class="font-bold" style="color: #e11d48; font-size: 16px;">৳ ${w.amount.toLocaleString()}</td></tr>
            <tr><td class="font-bold">Status:</td><td>${w.status.toUpperCase()}</td></tr>
            <tr><td class="font-bold">Authorized By:</td><td>${w.approvedBy || 'Operations Staff'}</td></tr>
            <tr><td class="font-bold">Disbursement Date:</td><td>${new Date(w.date).toLocaleString()}</td></tr>
          </table>
          <div class="sig-row">
            <div class="sig-line">Paid By (Cashier)</div>
            <div class="sig-line">Authorized Manager</div>
            <div class="sig-line">Receiver Signature</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const pendingList = withdrawals.filter(w => w.status === 'Pending');
  const historyList = withdrawals.filter(w => w.status !== 'Pending');

  return (
    <AppLayout>
      <PageHeader
        title="Savings Withdrawal Workflow & Approvals"
        subtitle="End-to-end savings withdrawal management: Application requisition, Managerial Approval Queue, and Disbursement Audit Log."
        breadcrumbs={[{ label: 'Savings', href: '/savings/deposits' }, { label: 'Withdrawals' }]}
        action={
          <Link
            href="/savings/withdrawals/apply"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <i className="fa-solid fa-plus-circle"></i>
            Apply New Withdrawal
          </Link>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase text-amber-700 block">Pending Approvals</span>
            <span className="text-2xl font-black text-amber-900">{stats.pendingCount} Requisitions</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <i className="fa-solid fa-hourglass-half"></i>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase text-emerald-700 block">Approved & Disbursed</span>
            <span className="text-2xl font-black text-emerald-900">{stats.approvedCount} Processed</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <i className="fa-solid fa-check-double"></i>
          </div>
        </div>

        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase text-rose-700 block">Rejected Requisitions</span>
            <span className="text-2xl font-black text-rose-900">{stats.rejectedCount} Rejected</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <i className="fa-solid fa-ban"></i>
          </div>
        </div>
      </div>

      {/* Workflow Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-4 gap-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <i className="fa-solid fa-clipboard-check"></i>
            Approval Queue
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-black">
              {pendingList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <i className="fa-solid fa-clock-rotate-left"></i>
            Withdrawal History & Disbursement Log
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-black">
              {historyList.length}
            </span>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === 'pending' ? (
            /* Pending Approval Queue */
            pendingList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <i className="fa-solid fa-circle-check text-3xl mb-2 text-emerald-400 block"></i>
                All clear! No pending withdrawal requisitions awaiting approval.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-3">Req No</th>
                      <th className="py-3 px-3">Member & ID</th>
                      <th className="py-3 px-3">Account Book</th>
                      <th className="py-3 px-3 text-right">Live Balance</th>
                      <th className="py-3 px-3 text-right">Withdrawal Amount</th>
                      <th className="py-3 px-3">Reason / Applied By</th>
                      <th className="py-3 px-3 text-center">Decision Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingList.map(w => (
                      <tr key={w._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-blue-600">{w.requestNo}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">{w.memberName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{w.memberAccountNo}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800 block">{w.accountNo}</span>
                          <span className="text-[10px] text-blue-600">{w.schemeType}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-600">
                          ৳ {w.availableBalance.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-rose-600 text-sm">
                          ৳ {w.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs">
                          <span className="block truncate">{w.reason}</span>
                          <span className="text-[10px] text-slate-400">By: {w.appliedBy} ({new Date(w.date).toLocaleDateString()})</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => handleAction(w._id, 'Approve')}
                              disabled={processingId === w._id}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <i className="fa-solid fa-check text-[10px]"></i>
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(w._id, 'Reject')}
                              disabled={processingId === w._id}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <i className="fa-solid fa-xmark text-[10px]"></i>
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* History & Log */
            historyList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No past withdrawal records found in history.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-3">Req No</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Member</th>
                      <th className="py-3 px-3">Account Book</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3">Processed By</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historyList.map(w => (
                      <tr key={w._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">{w.requestNo}</td>
                        <td className="py-3 px-3 text-slate-500">{new Date(w.date).toLocaleDateString()}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{w.memberName}</td>
                        <td className="py-3 px-3 text-slate-600">{w.accountNo} ({w.schemeType})</td>
                        <td className="py-3 px-3 text-right font-black text-rose-600">
                          ৳ {w.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {w.approvedBy || 'Operations Staff'}
                          {w.rejectionReason && (
                            <span className="text-[10px] text-rose-600 block italic">({w.rejectionReason})</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant={w.status === 'Approved' ? 'success' : 'danger'}>
                            {w.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {w.status === 'Approved' && (
                            <button
                              onClick={() => handlePrintVoucher(w)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md transition-colors flex items-center gap-1 mx-auto"
                              title="Print Debit Voucher"
                            >
                              <i className="fa-solid fa-print text-[10px]"></i>
                              Voucher
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </AppLayout>
  );
}
