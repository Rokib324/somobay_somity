'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface LoanItem {
  _id: string;
  loanNo: string;
  memberName: string;
  productName: string;
  principalAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: string;
  branch: string;
}

const inputClass = 'w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300';

export default function LoanClosingPage() {
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [rebateAmount, setRebateAmount] = useState<number | ''>('');
  const [settlementMethod, setSettlementMethod] = useState('Cash Payment at Counter');
  const [remarks, setRemarks] = useState('Full maturity repayment settlement');
  const [closedLoan, setClosedLoan] = useState<LoanItem | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  const fetchActiveLoans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/loans?limit=100');
      const data = await res.json();
      const list = (data.loans || []).filter((l: LoanItem) => l.status === 'active' || l.status === 'disbursed');
      setLoans(list);
      if (list.length > 0) setSelectedLoanId(list[0]._id);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  const selectedLoan = loans.find(l => l._id === selectedLoanId);

  const rebate = typeof rebateAmount === 'number' ? rebateAmount : 0;
  const finalSettlementAmount = Math.max(0, (selectedLoan?.dueAmount || 0) - rebate);

  const handleCloseLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) {
      alert('Please select an active loan account to close');
      return;
    }

    const confirmClose = window.confirm(
      `Confirm early settlement and closure of loan ${selectedLoan.loanNo} for ${selectedLoan.memberName}? Outstanding due ৳ ${selectedLoan.dueAmount.toLocaleString()} will be marked fully settled.`
    );
    if (!confirmClose) return;

    setClosing(true);
    try {
      const res = await fetch(`/api/loans/${selectedLoan._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'closed',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to close loan');
        return;
      }

      const updated = await res.json();
      setClosedLoan({ ...selectedLoan, status: 'closed', dueAmount: 0 });
      alert('Loan account successfully settled and closed! Loan Clearance Certificate generated.');
      fetchActiveLoans();
    } catch {
      alert('Network error while settling loan');
    } finally {
      setClosing(false);
    }
  };

  const handlePrintCertificate = () => {
    const content = certificateRef.current;
    if (!content || !closedLoan) return;

    const printWindow = window.open('', '_blank', 'width=800,height=700');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Loan Clearance Certificate - ${closedLoan.loanNo}</title>
          <style>
            @page { size: portrait; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12px; color: #0f172a; margin: 0; padding: 20px; }
            .cert-box { border: 4px double #1e3a8a; padding: 30px; text-align: center; }
            .org-name { font-size: 20px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; margin: 0; }
            .cert-title { font-size: 16px; font-weight: 800; color: #047857; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: 1px; }
            .cert-body { font-size: 13px; line-height: 1.8; color: #334155; margin: 20px 0; text-align: justify; }
            .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; text-align: left; }
            .details-table td { padding: 6px; border-bottom: 1px solid #e2e8f0; }
            .sig-grid { display: flex; justify-content: space-between; margin-top: 60px; }
            .sig-line { border-top: 1px solid #475569; width: 150px; padding-top: 4px; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <h1 class="org-name">Somity Online Multi-Purpose Cooperative Society</h1>
            <p style="font-size: 10px; color: #64748b;">Registration No: SOM-DH-2024/0912 | Head Office: Dhaka, Bangladesh</p>
            <div class="cert-title">LOAN CLEARANCE & NO OBJECTION CERTIFICATE (NOC)</div>
            <div class="cert-body">
              This is to certify that member <strong>${closedLoan.memberName}</strong> holding Loan Account Number <strong>${closedLoan.loanNo}</strong> (${closedLoan.productName}) has successfully repaid all principal, interest, and operational dues in full. The loan ledger has been formally closed with zero outstanding liability.
            </div>
            <table class="details-table">
              <tr><td><strong>Loan Account No:</strong></td><td>${closedLoan.loanNo}</td><td><strong>Borrower:</strong></td><td>${closedLoan.memberName}</td></tr>
              <tr><td><strong>Principal Disbursed:</strong></td><td>৳ ${closedLoan.principalAmount.toLocaleString()}</td><td><strong>Total Repaid:</strong></td><td>৳ ${closedLoan.totalAmount.toLocaleString()}</td></tr>
              <tr><td><strong>Branch:</strong></td><td>${closedLoan.branch}</td><td><strong>Closure Date:</strong></td><td>${new Date().toLocaleDateString()}</td></tr>
              <tr><td><strong>Final Due Status:</strong></td><td colspan="3" style="color: #047857; font-weight: bold;">NIL / ৳ 0 (Fully Discharged)</td></tr>
            </table>
            <div class="sig-grid">
              <div class="sig-line">Loan Recovery Officer</div>
              <div class="sig-line">Branch Manager</div>
              <div class="sig-line">Borrower Signature</div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AppLayout>
      <PageHeader
        title="Stage 6: Loan Settlement & Account Closing"
        subtitle="Process final maturity payoffs, early loan settlements, account closures, and generate official Clearance Certificates."
        breadcrumbs={[{ label: 'Loans', href: '/loans' }, { label: 'Loan Closing' }]}
        action={
          <div className="flex gap-2">
            <Link
              href="/loans/schedules"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-calendar-days"></i>
              Repayment Schedules
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Closing Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-5">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <i className="fa-solid fa-circle-check text-3xl mb-2 text-emerald-500 block"></i>
              No active or outstanding loans requiring settlement!
            </div>
          ) : (
            <form onSubmit={handleCloseLoan} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Active Loan Account *</label>
                <select
                  className={inputClass}
                  value={selectedLoanId}
                  onChange={e => setSelectedLoanId(e.target.value)}
                >
                  {loans.map(l => (
                    <option key={l._id} value={l._id}>
                      {l.loanNo} — {l.memberName} (Due: ৳ {l.dueAmount.toLocaleString()}) - {l.branch}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Loan Ledger Breakdown */}
              {selectedLoan && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">{selectedLoan.memberName}</span>
                      <span className="font-mono text-[10px] text-blue-600 font-bold">{selectedLoan.loanNo} ({selectedLoan.productName})</span>
                    </div>
                    <Badge variant="warning">{selectedLoan.status.toUpperCase()}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Principal Disbursed:</span>
                      <span className="font-bold text-slate-800">৳ {selectedLoan.principalAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Paid To Date:</span>
                      <span className="font-bold text-emerald-600">৳ {selectedLoan.paidAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Remaining Due Balance:</span>
                      <span className="font-black text-rose-600 font-mono text-sm">৳ {selectedLoan.dueAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Settlement adjustments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Early Payoff Rebate / Waiver (৳)</label>
                  <input
                    type="number"
                    min={0}
                    max={selectedLoan?.dueAmount || undefined}
                    placeholder="0"
                    className={inputClass}
                    value={rebateAmount}
                    onChange={e => setRebateAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <span className="text-[10px] text-slate-400">Optional discount on final interest</span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Settlement Method</label>
                  <select
                    className={inputClass}
                    value={settlementMethod}
                    onChange={e => setSettlementMethod(e.target.value)}
                  >
                    <option>Cash Payment at Counter</option>
                    <option>Deduction from Member Savings Book</option>
                    <option>Bank Deposit / Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Settlement Remarks</label>
                <input
                  type="text"
                  className={inputClass}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>

              {/* Calculation Summary Box */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <span className="font-extrabold text-emerald-800 text-xs uppercase block">Final Clearance Breakdown</span>
                <div className="flex justify-between text-xs py-1 border-b border-emerald-100">
                  <span className="text-slate-600">Current Outstanding Due:</span>
                  <span className="font-bold text-slate-900 font-mono">৳ {(selectedLoan?.dueAmount || 0).toLocaleString()}</span>
                </div>
                {rebate > 0 && (
                  <div className="flex justify-between text-xs py-1 border-b border-emerald-100 text-amber-700">
                    <span>Rebate / Discount Waived:</span>
                    <span className="font-bold font-mono">- ৳ {rebate.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 font-black text-emerald-950 text-base">
                  <span>Payable Settlement Amount:</span>
                  <span className="font-mono text-xl text-emerald-700">৳ {finalSettlementAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={closing || !selectedLoan}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-stamp"></i>
                {closing ? 'Processing Settlement...' : 'Issue Clearance & Close Loan Ledger'}
              </button>
            </form>
          )}
        </div>

        {/* Clearance Certificate Preview Card */}
        <div className="space-y-4">
          <div ref={certificateRef} className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
              <i className="fa-solid fa-certificate"></i>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Clearance Certificate</h3>
              <p className="text-[11px] text-slate-500">Official No-Liability Clearance for Settled Loans</p>
            </div>

            {closedLoan ? (
              <div className="space-y-3 pt-2 text-xs text-left border-t border-slate-100">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] leading-relaxed">
                  <strong>Status:</strong> Loan <strong>{closedLoan.loanNo}</strong> has been successfully settled with zero outstanding liability.
                </div>
                <div><strong>Borrower:</strong> {closedLoan.memberName}</div>
                <div><strong>Product:</strong> {closedLoan.productName}</div>
                <div><strong>Closed At:</strong> {new Date().toLocaleDateString()}</div>
                <button
                  onClick={handlePrintCertificate}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm mt-3"
                >
                  <i className="fa-solid fa-print"></i>
                  Print Official Clearance NOC
                </button>
              </div>
            ) : (
              <div className="py-8 text-slate-400 text-xs italic">
                Select an active loan and click "Issue Clearance" to settle the account and print certificate.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
