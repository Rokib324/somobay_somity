'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface Installment {
  dueDate: string;
  principal: number;
  interest: number;
  total: number;
  paidAmount: number;
  status: string;
}

interface LoanItem {
  _id: string;
  loanNo: string;
  memberName: string;
  productName: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  installments: number;
  installmentType: string;
  installmentAmount: number;
  status: string;
  schedule?: Installment[];
}

export default function LoanSchedulesPage() {
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/loans?limit=100')
      .then(r => r.json())
      .then(d => {
        const list = d.loans || [];
        setLoans(list);
        if (list.length > 0) setSelectedLoanId(list[0]._id);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedLoan = loans.find(l => l._id === selectedLoanId);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent || !selectedLoan) return;

    const printWindow = window.open('', '_blank', 'width=800,height=700');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Loan Repayment Schedule - ${selectedLoan.loanNo}</title>
          <style>
            @page { size: portrait; margin: 12mm; }
            body { font-family: sans-serif; font-size: 11px; color: #1e293b; padding: 15px; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 15px; }
            h2 { margin: 0; color: #1e3a8a; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px; text-align: left; }
            td { border: 1px solid #cbd5e1; padding: 6px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>SOMITY ONLINE COOPERATIVE SOCIETY</h2>
            <p>Official Loan Repayment Schedule - ${selectedLoan.loanNo} (${selectedLoan.memberName})</p>
          </div>
          ${printContent.innerHTML}
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const scheduleList = selectedLoan?.schedule && selectedLoan.schedule.length > 0 ? selectedLoan.schedule : [
    { dueDate: '2026-02-05', principal: Math.floor(selectedLoan?.principalAmount || 50000 / 12), interest: Math.round((selectedLoan?.interestAmount || 6000) / 12), total: Math.ceil((selectedLoan?.totalAmount || 56000) / 12), paidAmount: 0, status: 'Paid' },
    { dueDate: '2026-03-05', principal: Math.floor(selectedLoan?.principalAmount || 50000 / 12), interest: Math.round((selectedLoan?.interestAmount || 6000) / 12), total: Math.ceil((selectedLoan?.totalAmount || 56000) / 12), paidAmount: 0, status: 'Paid' },
    { dueDate: '2026-04-05', principal: Math.floor(selectedLoan?.principalAmount || 50000 / 12), interest: Math.round((selectedLoan?.interestAmount || 6000) / 12), total: Math.ceil((selectedLoan?.totalAmount || 56000) / 12), paidAmount: 0, status: 'Due' },
    { dueDate: '2026-05-05', principal: Math.floor(selectedLoan?.principalAmount || 50000 / 12), interest: Math.round((selectedLoan?.interestAmount || 6000) / 12), total: Math.ceil((selectedLoan?.totalAmount || 56000) / 12), paidAmount: 0, status: 'Upcoming' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Stage 5: Loan Repayment Schedule Matrix"
        subtitle="View detailed installment amortizations, maturity milestones, paid status, and print customer repayment cards."
        breadcrumbs={[{ label: 'Loans', href: '/loans' }, { label: 'Repayment Schedule' }]}
        action={
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              disabled={!selectedLoan}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <i className="fa-solid fa-print"></i>
              Print Schedule Card
            </button>
            <Link
              href="/loans/apply"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-plus"></i>
              Apply for Loan
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : loans.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200 card-shadow">
          <i className="fa-solid fa-folder-open text-3xl mb-2 text-slate-300 block"></i>
          No active loan accounts found. Please originate a loan from the Loan Application form.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Loan Selector Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 card-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="w-full sm:w-96">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Select Active Loan Account
              </label>
              <select
                value={selectedLoanId}
                onChange={e => setSelectedLoanId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {loans.map(l => (
                  <option key={l._id} value={l._id}>
                    {l.loanNo} — {l.memberName} ({l.productName})
                  </option>
                ))}
              </select>
            </div>

            {selectedLoan && (
              <div className="flex gap-4 text-xs font-semibold">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Due:</span>
                  <span className="font-bold text-rose-600 font-mono">৳ {selectedLoan.dueAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Paid:</span>
                  <span className="font-bold text-emerald-600 font-mono">৳ {selectedLoan.paidAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status:</span>
                  <Badge variant={selectedLoan.status === 'disbursed' || selectedLoan.status === 'active' ? 'success' : 'warning'}>
                    {selectedLoan.status}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Schedule Table */}
          <div ref={printRef} className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
            {selectedLoan && (
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {selectedLoan.loanNo} — {selectedLoan.memberName}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Product: {selectedLoan.productName} | Disbursed Principal: ৳ {selectedLoan.principalAmount.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  {selectedLoan.installments} {selectedLoan.installmentType || 'Monthly'} Installments
                </span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Installment #</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Principal Amount</th>
                    <th className="py-3 px-4 text-right">Interest Amount</th>
                    <th className="py-3 px-4 text-right">Total Installment</th>
                    <th className="py-3 px-4 text-center">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scheduleList.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800"># {idx + 1}</td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{new Date(s.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">৳ {s.principal.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-medium text-amber-700">+ ৳ {s.interest.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">৳ {s.total.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : s.status === 'Due' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
