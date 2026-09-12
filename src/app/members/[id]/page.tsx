'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { MemberIdCardModal } from '@/components/members/MemberIdCardModal';
import { use } from 'react';
import Link from 'next/link';

interface Nominee {
  name: string;
  relation: string;
  nid?: string;
  phone?: string;
  percentage: number;
  picture?: string;
}

interface Member {
  _id: string;
  accountNo: string;
  name: string;
  fatherName: string;
  motherName: string;
  spouseName?: string;
  dateOfBirth?: string;
  mobile: string;
  nid: string;
  category: string;
  branch: string;
  joinDate: string;
  address: string;
  photo?: string;
  signature?: string;
  status: 'active' | 'inactive' | 'pending';
  totalDeposit: number;
  totalLoan: number;
  nominee?: Nominee;
}

interface DepositAccount {
  _id: string;
  accountNo: string;
  type: string;
  amount: number;
  balance: number;
  interestRate: number;
  openingDate: string;
  percentage?: number;
  priority?: 'High' | 'Medium' | 'Low' | 'Normal';
  category?: string;
}

interface LoanAccount {
  _id: string;
  loanNo: string;
  productName: string;
  principalAmount: number;
  dueAmount: number;
  status: string;
}

export default function MemberDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [member, setMember] = useState<Member | null>(null);
  const [deposits, setDeposits] = useState<DepositAccount[]>([]);
  const [loans, setLoans] = useState<LoanAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIdCard, setShowIdCard] = useState(false);
  const otherBooksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/members/${id}`)
      .then(r => r.json())
      .then(data => {
        setMember(data.member ?? null);
        setDeposits(data.deposits ?? []);
        setLoans(data.loans ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handlePrintOtherBooks = () => {
    if (!otherBooksRef.current || !member) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to print');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Other Books Summary - ${member.name} (${member.accountNo})</title>
          <style>
            @page { size: portrait; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12px; color: #0f172a; margin: 0; padding: 15px; }
            .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 15px; }
            .org-title { font-size: 16px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; margin: 0; }
            .meta { margin-top: 5px; font-size: 11px; color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px; font-size: 11px; text-align: left; }
            td { border: 1px solid #cbd5e1; padding: 8px; font-size: 11px; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
            .sig-line { border-top: 1px solid #64748b; width: 150px; text-align: center; padding-top: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="org-title">Somity Online Multi-Purpose Cooperative Society</h1>
            <div class="meta">
              <strong>Member:</strong> ${member.name} &nbsp;|&nbsp;
              <strong>Member ID:</strong> ${member.accountNo} &nbsp;|&nbsp;
              <strong>Branch:</strong> ${member.branch} &nbsp;|&nbsp;
              <strong>Date:</strong> ${new Date().toLocaleDateString()}
            </div>
          </div>
          <h3 style="font-size: 13px; margin: 10px 0;">Official "Other Books" Ledger Accounts</h3>
          <table>
            <thead>
              <tr>
                <th>Account No</th>
                <th>Book / Account Type</th>
                <th>Category</th>
                <th>Interest / Share %</th>
                <th>Priority</th>
                <th>Opening Date</th>
                <th class="text-right">Live Balance</th>
              </tr>
            </thead>
            <tbody>
              ${deposits.map(d => `
                <tr>
                  <td class="font-bold">${d.accountNo}</td>
                  <td>${d.type}</td>
                  <td>${d.category || 'General'}</td>
                  <td>${d.percentage ? `${d.percentage}%` : `${d.interestRate}%`}</td>
                  <td>${d.priority || 'Normal'}</td>
                  <td>${new Date(d.openingDate).toLocaleDateString()}</td>
                  <td class="text-right font-bold">৳ ${d.balance.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="text-right font-bold">Total Books Balance:</td>
                <td class="text-right font-bold">৳ ${deposits.reduce((sum, d) => sum + d.balance, 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          <div class="footer">
            <div class="sig-line">Prepared By (Teller)</div>
            <div class="sig-line">Verified Officer</div>
            <div class="sig-line">Member Signature</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!member) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96 text-slate-400">Member not found</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={`Member Profile: ${member.name}`}
        subtitle={`Member ID: ${member.accountNo} | Category: ${member.category} | Branch: ${member.branch}`}
        breadcrumbs={[{ label: 'Members', href: '/members' }, { label: member.name }]}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setShowIdCard(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <i className="fa-solid fa-id-card"></i>
              View & Print ID Card
            </button>
            <Link
              href="/savings/create"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <i className="fa-solid fa-plus-circle"></i>
              Open New Book/Account
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Member Master Profile & Nominee Information */}
        <div className="space-y-6">
          {/* Member Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4 text-center">
            <div className="relative inline-block">
              <div className="w-28 h-28 rounded-full border-4 border-blue-600 overflow-hidden bg-slate-100 flex items-center justify-center text-blue-600 font-extrabold text-3xl shadow-md mx-auto">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  member.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">{member.name}</h3>
              <span className="font-mono text-xs text-blue-600 font-bold block mt-0.5">{member.accountNo}</span>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-full">
                {member.category}
              </span>
            </div>

            <div>
              <Badge variant={member.status === 'active' ? 'success' : 'warning'}>
                {member.status.toUpperCase()}
              </Badge>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-left">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">National ID (NID):</span>
                <span className="font-bold text-slate-800 font-mono">{member.nid}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Date of Birth:</span>
                <span className="font-bold text-slate-800">
                  {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Opening / Join Date:</span>
                <span className="font-bold text-slate-800">
                  {new Date(member.joinDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Father's Name:</span>
                <span className="font-bold text-slate-800">{member.fatherName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Mother's Name:</span>
                <span className="font-bold text-slate-800">{member.motherName}</span>
              </div>
              {member.spouseName && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Spouse:</span>
                  <span className="font-bold text-slate-800">{member.spouseName}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Mobile:</span>
                <span className="font-bold text-slate-800">{member.mobile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Branch:</span>
                <span className="font-bold text-slate-800">{member.branch}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-400 font-medium block mb-0.5">Address:</span>
                <span className="font-semibold text-slate-700 leading-tight block">{member.address || 'Not recorded'}</span>
              </div>
            </div>

            {/* Member Signature Card */}
            <div className="pt-3 border-t border-slate-100 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Official Specimen Signature
              </span>
              <div className="h-14 border border-dashed border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center p-2">
                {member.signature ? (
                  <img src={member.signature} alt="Member Signature" className="max-h-full object-contain" />
                ) : (
                  <span className="text-xs font-serif italic text-slate-600">
                    {member.name.split(' ').slice(0, 2).join(' ')} (Signed on record)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Nominee Details Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
              <i className="fa-solid fa-user-shield text-blue-600"></i>
              Nominee Details
            </h4>

            {member.nominee ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full border-2 border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center text-slate-500 font-bold text-lg flex-shrink-0">
                    {member.nominee.picture ? (
                      <img src={member.nominee.picture} alt={member.nominee.name} className="w-full h-full object-cover" />
                    ) : (
                      member.nominee.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{member.nominee.name}</h5>
                    <span className="text-xs text-blue-600 font-semibold">{member.nominee.relation}</span>
                    <span className="text-[10px] block text-slate-400">Share: {member.nominee.percentage}%</span>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 pt-2 border-t border-slate-100 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nominee ID (NID):</span>
                    <span className="font-bold text-slate-800 font-mono">{member.nominee.nid || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nominee Contact:</span>
                    <span className="font-bold text-slate-800">{member.nominee.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No nominee recorded for this member profile.</p>
            )}
          </div>
        </div>

        {/* Right Column: Financial Balances & "Other Books" Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Balance Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1.5">
                <i className="fa-solid fa-book-bookmark"></i>
                Total Passbook / Account Balance
              </span>
              <h2 className="text-2xl font-black text-emerald-900">৳ {member.totalDeposit.toLocaleString()}</h2>
              <span className="text-[10px] text-emerald-600 font-medium block">
                Across {deposits.length} active savings/share book accounts
              </span>
            </div>
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-amber-700 uppercase flex items-center gap-1.5">
                <i className="fa-solid fa-hand-holding-dollar"></i>
                Active Loan Liability
              </span>
              <h2 className="text-2xl font-black text-amber-900">৳ {member.totalLoan.toLocaleString()}</h2>
              <span className="text-[10px] text-amber-600 font-medium block">
                {loans.length} registered loan accounts
              </span>
            </div>
          </div>

          {/* "Other Books" (Additional Accounts) Section */}
          <div ref={otherBooksRef} className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-book text-blue-600"></i>
                  "Other Books" (Registered Account Books)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Comprehensive listing of all deposit, share capital, and investment books held under Member ID {member.accountNo}.
                </p>
              </div>
              <button
                onClick={handlePrintOtherBooks}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <i className="fa-solid fa-print"></i>
                Print Other Books
              </button>
            </div>

            {deposits.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <i className="fa-solid fa-folder-open text-2xl mb-2 text-slate-300 block"></i>
                No active savings or share capital books recorded for this member.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">Account No</th>
                      <th className="py-2.5 px-3">Book Type</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Balance</th>
                      <th className="py-2.5 px-3 text-center">Interest / %</th>
                      <th className="py-2.5 px-3 text-center">Priority</th>
                      <th className="py-2.5 px-3">Opened</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deposits.map(dep => {
                      const priorityColor =
                        dep.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        dep.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        dep.priority === 'Low' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                        'bg-blue-50 text-blue-700 border-blue-200';

                      return (
                        <tr key={dep._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-blue-600">{dep.accountNo}</td>
                          <td className="py-3 px-3 font-bold text-slate-800">{dep.type}</td>
                          <td className="py-3 px-3 text-slate-600">{dep.category || 'General'}</td>
                          <td className="py-3 px-3 text-right font-black text-emerald-600 text-sm">
                            ৳ {dep.balance.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">
                            {dep.percentage ? `${dep.percentage}%` : `${dep.interestRate}%`}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${priorityColor}`}>
                              {dep.priority || 'Normal'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {new Date(dep.openingDate).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Loan Details */}
          {loans.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <i className="fa-solid fa-hand-holding-dollar text-amber-600"></i>
                Active Loan Accounts ({loans.length})
              </h3>
              <div className="space-y-3 text-xs">
                {loans.map(loan => (
                  <div key={loan._id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900">{loan.loanNo} — {loan.productName}</h4>
                      <span className="text-slate-400 text-[10px]">
                        Disbursed Principal: ৳ {loan.principalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-600 text-sm block">
                        ৳ {loan.dueAmount.toLocaleString()} due
                      </span>
                      <Badge variant={loan.status === 'active' ? 'success' : 'warning'}>{loan.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Member ID Card Modal */}
      <MemberIdCardModal
        isOpen={showIdCard}
        onClose={() => setShowIdCard(false)}
        member={member}
      />
    </AppLayout>
  );
}
