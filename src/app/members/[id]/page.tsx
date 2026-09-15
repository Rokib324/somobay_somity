'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { MemberIdCardModal } from '@/components/members/MemberIdCardModal';
import { EditMemberDetailsModal } from '@/components/members/EditMemberDetailsModal';
import { SignatureBox } from '@/components/common/SignatureBox';
import { MemberFinancialDisciplineSection } from '@/components/members/MemberFinancialDisciplineSection';
import { Member, DepositAccount, LoanAccount } from '@/types';
import { use } from 'react';
import Link from 'next/link';

export default function MemberDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;
  const [member, setMember] = useState<Member | null>(null);
  const [deposits, setDeposits] = useState<DepositAccount[]>([]);
  const [loans, setLoans] = useState<LoanAccount[]>([]);
  const [guaranteedLoans, setGuaranteedLoans] = useState<LoanAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIdCard, setShowIdCard] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const otherBooksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/members/${id}`)
      .then(r => r.json())
      .then(data => {
        setMember(data.member ?? null);
        setDeposits(data.deposits ?? []);
        setLoans(data.loans ?? []);
        setGuaranteedLoans(data.guaranteedLoans ?? []);
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

  const nomineePhoto = member.nominee?.photo || member.nominee?.picture;
  const guarantorPhoto = member.guarantor?.photo;

  return (
    <AppLayout>
      <PageHeader
        title={`Member Profile: ${member.name}`}
        subtitle={`Member ID: ${member.accountNo} | Category: ${member.category} | Branch: ${member.branch}`}
        breadcrumbs={[{ label: 'Members', href: '/members' }, { label: member.name }]}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 border border-slate-300 shadow-sm transition-colors"
            >
              <i className="fa-solid fa-user-pen text-blue-600"></i>
              Edit KYC & Records
            </button>
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
        {/* Left Column: Member Master Profile, Nominee, and Personal Guarantor Details */}
        <div className="space-y-6">
          {/* Member Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4 text-center">
            <div className="relative inline-block group">
              <div
                onClick={() => {
                  if (member.photo) setPreviewImage({ url: member.photo, title: `${member.name} (Member Photo)` });
                }}
                className={`w-28 h-28 rounded-full border-4 border-blue-600 overflow-hidden bg-slate-100 flex items-center justify-center text-blue-600 font-extrabold text-3xl shadow-md mx-auto ${
                  member.photo ? 'cursor-pointer hover:opacity-95' : ''
                }`}
              >
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  member.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <span
                className={`absolute bottom-1 right-1 w-4 h-4 border-2 border-white rounded-full ${
                  member.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={`Status: ${member.status}`}
              ></span>

              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="absolute top-0 right-0 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-[10px] shadow border-2 border-white transition-transform hover:scale-110"
                title="Change Member Photo"
              >
                <i className="fa-solid fa-camera"></i>
              </button>
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

            {/* Member Specimen Signature Box */}
            <div className="pt-3 border-t border-slate-100">
              <SignatureBox
                signatureUrl={member.signature}
                name={member.name}
                title="Member Specimen Signature"
                subtitle="Official KYC Record"
                heightClass="h-16"
              />
            </div>
          </div>

          {/* Section 1: Nominee Details Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i className="fa-solid fa-user-shield text-blue-600"></i>
                Nominee Details
              </h4>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold"
              >
                Edit
              </button>
            </div>

            {member.nominee ? (
              <div className="space-y-4">
                {/* Passport size framed photo & Name */}
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 text-center">
                    <div
                      onClick={() => {
                        if (nomineePhoto) {
                          setPreviewImage({ url: nomineePhoto, title: `${member.nominee?.name} (Nominee Photo)` });
                        }
                      }}
                      className={`w-20 h-28 rounded-lg border-2 border-slate-300 bg-slate-100 overflow-hidden shadow-sm flex items-center justify-center relative group ${
                        nomineePhoto ? 'cursor-pointer hover:border-blue-500' : ''
                      }`}
                    >
                      {nomineePhoto ? (
                        <img
                          src={nomineePhoto}
                          alt={member.nominee.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-center p-1 text-slate-400">
                          <i className="fa-solid fa-user text-2xl mb-1 block"></i>
                          <span className="text-[9px] font-bold block leading-tight">Passport Photo</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block mt-1 tracking-wider">
                      Passport Size
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h5 className="font-bold text-slate-900 text-sm leading-tight">{member.nominee.name}</h5>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-md border border-blue-100">
                        {member.nominee.relation}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-md border border-emerald-100">
                        {member.nominee.percentage}% Share
                      </span>
                    </div>

                    {member.nominee.occupation && (
                      <p className="text-[11px] text-slate-600">
                        <span className="text-slate-400">Profession:</span> {member.nominee.occupation}
                      </p>
                    )}
                    {member.nominee.dateOfBirth && (
                      <p className="text-[11px] text-slate-600">
                        <span className="text-slate-400">DOB:</span>{' '}
                        {new Date(member.nominee.dateOfBirth).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Nominee Details */}
                <div className="text-xs space-y-1.5 pt-2 border-t border-slate-100 text-slate-600">
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-400">Nominee NID:</span>
                    <span className="font-bold text-slate-800 font-mono">{member.nominee.nid || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-400">Nominee Contact:</span>
                    <span className="font-bold text-slate-800">{member.nominee.phone || 'N/A'}</span>
                  </div>
                  {member.nominee.address && (
                    <div className="py-0.5">
                      <span className="text-slate-400 block mb-0.5">Address:</span>
                      <span className="font-medium text-slate-700 block leading-tight">{member.nominee.address}</span>
                    </div>
                  )}
                </div>

                {/* Nominee Specimen Signature */}
                <div className="pt-2 border-t border-slate-100">
                  <SignatureBox
                    signatureUrl={member.nominee.signature}
                    name={member.nominee.name}
                    title="Nominee Specimen Signature"
                    subtitle="Benefit Claimant"
                    heightClass="h-14"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                <i className="fa-solid fa-user-shield text-2xl mb-1 text-slate-300 block"></i>
                No nominee recorded for this member.
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="mt-2 block mx-auto text-blue-600 font-bold hover:underline"
                >
                  + Add Nominee Details
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Personal Guarantor Details Card (Below Nominee) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-user-check text-blue-600"></i>
                  Guarantor Details
                </h4>
                <p className="text-[10px] text-slate-500">Security guarantor for this member</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold"
              >
                Edit
              </button>
            </div>

            {member.guarantor ? (
              <div className="space-y-4">
                {/* Passport size framed photo & Name */}
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 text-center">
                    <div
                      onClick={() => {
                        if (guarantorPhoto) {
                          setPreviewImage({ url: guarantorPhoto, title: `${member.guarantor?.name} (Guarantor Photo)` });
                        }
                      }}
                      className={`w-20 h-28 rounded-lg border-2 border-slate-300 bg-slate-100 overflow-hidden shadow-sm flex items-center justify-center relative group ${
                        guarantorPhoto ? 'cursor-pointer hover:border-blue-500' : ''
                      }`}
                    >
                      {guarantorPhoto ? (
                        <img
                          src={guarantorPhoto}
                          alt={member.guarantor.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-center p-1 text-slate-400">
                          <i className="fa-solid fa-user-tie text-2xl mb-1 block"></i>
                          <span className="text-[9px] font-bold block leading-tight">Passport Photo</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block mt-1 tracking-wider">
                      Passport Size
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h5 className="font-bold text-slate-900 text-sm leading-tight">{member.guarantor.name}</h5>

                    {member.guarantor.accountNo ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-medium">Account:</span>
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {member.guarantor.accountNo}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-block text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                        External Institutional Guarantor
                      </span>
                    )}

                    <div className="flex flex-wrap gap-1.5 items-center mt-1">
                      {member.guarantor.relation && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold text-[10px] rounded-md">
                          {member.guarantor.relation}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-md border border-emerald-100 flex items-center gap-1">
                        <i className="fa-solid fa-shield-check text-[9px]"></i>
                        {member.guarantor.status || 'Verified Guarantor'}
                      </span>
                    </div>

                    {member.guarantor.occupation && (
                      <p className="text-[11px] text-slate-600">
                        <span className="text-slate-400">Occupation:</span> {member.guarantor.occupation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Guarantor Details */}
                <div className="text-xs space-y-1.5 pt-2 border-t border-slate-100 text-slate-600">
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-400">Guarantor NID:</span>
                    <span className="font-bold text-slate-800 font-mono">{member.guarantor.nid || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-400">Contact Mobile:</span>
                    <span className="font-bold text-slate-800">{member.guarantor.phone || 'N/A'}</span>
                  </div>
                  {member.guarantor.address && (
                    <div className="py-0.5">
                      <span className="text-slate-400 block mb-0.5">Address:</span>
                      <span className="font-medium text-slate-700 block leading-tight">{member.guarantor.address}</span>
                    </div>
                  )}
                </div>

                {/* Guarantor Specimen Signature Box */}
                <div className="pt-2 border-t border-slate-100">
                  <SignatureBox
                    signatureUrl={member.guarantor.signature}
                    name={member.guarantor.name}
                    title="Guarantor Specimen Signature"
                    subtitle="Security Guarantee"
                    heightClass="h-14"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                <i className="fa-solid fa-user-check text-2xl mb-1 text-slate-300 block"></i>
                No personal guarantor recorded for this member.
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="mt-2 block mx-auto text-blue-600 font-bold hover:underline"
                >
                  + Add Guarantor Particulars
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Financial Balances, "Other Books", Loans, and "Guarantor to the Accounts" */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Balance Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1.5">
                <i className="fa-solid fa-book-bookmark"></i>
                Passbook Balance
              </span>
              <h2 className="text-2xl font-black text-emerald-900">৳ {member.totalDeposit.toLocaleString()}</h2>
              <span className="text-[10px] text-emerald-600 font-medium block">
                Across {deposits.length} deposit/share accounts
              </span>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1.5">
                <i className="fa-solid fa-hand-holding-dollar"></i>
                Own Loan Liability
              </span>
              <h2 className="text-2xl font-black text-amber-900">৳ {member.totalLoan.toLocaleString()}</h2>
              <span className="text-[10px] text-amber-600 font-medium block">
                {loans.length} registered loan accounts
              </span>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-indigo-700 uppercase flex items-center gap-1.5">
                <i className="fa-solid fa-user-group"></i>
                Guaranteed Exposure
              </span>
              <h2 className="text-2xl font-black text-indigo-900">
                ৳ {guaranteedLoans.reduce((sum, l) => sum + (l.dueAmount || 0), 0).toLocaleString()}
              </h2>
              <span className="text-[10px] text-indigo-600 font-medium block">
                Guarantor for {guaranteedLoans.length} external loans
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
                        <tr key={dep._id || dep.id} className="hover:bg-slate-50 transition-colors">
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

          {/* Active Loan Details (Loans taken by this Member) */}
          {loans.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <i className="fa-solid fa-hand-holding-dollar text-amber-600"></i>
                Active Loans Taken By Member ({loans.length})
              </h3>
              <div className="space-y-3 text-xs">
                {loans.map(loan => (
                  <div key={loan._id || loan.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
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

          {/* Member Financial Discipline & Repayment History Section */}
          <MemberFinancialDisciplineSection
            loans={loans}
            memberName={member.name}
            memberAccountNo={member.accountNo}
            memberBranch={member.branch}
          />

          {/* Section 3: "Guarantor to the Accounts" Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-handshake-angle text-indigo-600"></i>
                  Guarantor to the Accounts
                </h3>
                <p className="text-[11px] text-slate-500">
                  Accounts and loan facilities for which Member <strong>{member.name}</strong> ({member.accountNo}) serves as a guarantor.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-200">
                  {guaranteedLoans.length} Guaranteed {guaranteedLoans.length === 1 ? 'Account' : 'Accounts'}
                </span>
              </div>
            </div>

            {/* Summary Exposure Box */}
            {guaranteedLoans.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Guaranteed Principal</span>
                  <span className="font-bold text-indigo-950 text-sm">
                    ৳ {guaranteedLoans.reduce((sum, l) => sum + (l.principalAmount || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Outstanding Liability</span>
                  <span className="font-bold text-rose-600 text-sm">
                    ৳ {guaranteedLoans.reduce((sum, l) => sum + (l.dueAmount || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Risk Exposure Level</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-xs mt-0.5">
                    <i className="fa-solid fa-circle-check text-[10px]"></i>
                    Accounts In Good Standing
                  </span>
                </div>
              </div>
            )}

            {/* Guaranteed Loans Table */}
            {guaranteedLoans.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2 text-xl">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <h4 className="font-bold text-slate-700 mb-0.5">No Guaranteed Accounts on Record</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  This member is currently not registered as a guarantor for any external loan accounts or borrowing members.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">Loan Account</th>
                      <th className="py-2.5 px-3">Borrower / Member</th>
                      <th className="py-2.5 px-3">Product & Branch</th>
                      <th className="py-2.5 px-3 text-right">Guaranteed Amount</th>
                      <th className="py-2.5 px-3 text-right">Outstanding Due</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {guaranteedLoans.map(loan => (
                      <tr key={loan._id || loan.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-indigo-600">
                          {loan.loanNo}
                          {loan.disbursementDate && (
                            <span className="block text-[10px] text-slate-400 font-normal font-sans">
                              {new Date(loan.disbursementDate).toLocaleDateString()}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <Link
                            href={loan.memberId ? `/members/${loan.memberId}` : '#'}
                            className="font-bold text-slate-800 hover:text-blue-600 block transition-colors"
                          >
                            {loan.memberName}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Borrower ID: {loan.memberId ? String(loan.memberId).slice(-6) : 'N/A'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-700 block">{loan.productName}</span>
                          <span className="text-[10px] text-slate-400">{loan.branch || 'Main Branch'}</span>
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-slate-800">
                          ৳ {loan.principalAmount.toLocaleString()}
                        </td>

                        <td className="py-3 px-3 text-right font-black text-rose-600">
                          ৳ {loan.dueAmount.toLocaleString()}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <Badge
                            variant={
                              loan.status === 'active' || loan.status === 'disbursed'
                                ? 'success'
                                : loan.status === 'pending_approval'
                                ? 'warning'
                                : 'neutral'
                            }
                          >
                            {String(loan.status).replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <Link
                            href={loan.memberId ? `/members/${loan.memberId}` : '/loans'}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded transition-colors inline-flex items-center gap-1"
                            title="View borrower details"
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member ID Card Modal */}
      <MemberIdCardModal
        isOpen={showIdCard}
        onClose={() => setShowIdCard(false)}
        member={member}
      />

      {/* Edit KYC & Records Modal */}
      {member && (
        <EditMemberDetailsModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          member={member}
          onUpdated={updatedMember => setMember(updatedMember)}
        />
      )}

      {/* High-Resolution Photo Zoom Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-2xl p-4 max-w-sm w-full shadow-2xl border border-slate-200 text-center relative animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 mb-3 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-800">{previewImage.title}</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="w-full max-h-96 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border">
              <img src={previewImage.url} alt="Preview" className="max-h-96 w-auto object-contain" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-mono">Official Somity Online Verified Identity Document</p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
