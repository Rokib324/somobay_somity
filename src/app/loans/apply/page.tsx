'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface MemberItem {
  _id: string;
  name: string;
  accountNo: string;
  mobile: string;
  branch: string;
  category: string;
  totalDeposit: number;
}

const LOAN_PRODUCTS = [
  { name: 'General Micro-Credit', defaultRate: 12.5, maxTerm: 12, maxAmount: 100000 },
  { name: 'Agri Crop & Livestock Loan', defaultRate: 9.0, maxTerm: 12, maxAmount: 300000 },
  { name: 'SME / Business Enterprise Loan', defaultRate: 14.0, maxTerm: 36, maxAmount: 1500000 },
  { name: 'Emergency Contingency Credit', defaultRate: 8.0, maxTerm: 6, maxAmount: 50000 },
  { name: 'Women Entrepreneur Loan', defaultRate: 10.0, maxTerm: 24, maxAmount: 500000 },
  { name: 'Asset & Vehicle Purchase Loan', defaultRate: 13.0, maxTerm: 48, maxAmount: 1000000 },
];

const inputClass = 'w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300';

export default function ApplyLoanPage() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    memberId: '',
    memberName: '',
    productName: 'General Micro-Credit',
    principalAmount: '50000',
    interestRate: '12.5',
    installments: '12',
    installmentType: 'Monthly',
    branch: 'Main Branch',
    purpose: 'Business inventory expansion',
    guarantorName: '',
    guarantorMobile: '',
    guarantorNid: '',
    guarantorRelation: '',
  });

  useEffect(() => {
    fetch('/api/members?limit=200')
      .then(r => r.json())
      .then(d => {
        const list = d.members || [];
        setMembers(list);
        if (list.length > 0) {
          setForm(f => ({
            ...f,
            memberId: list[0]._id,
            memberName: list[0].name,
            branch: list[0].branch || 'Main Branch',
          }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedMember = members.find(m => m._id === form.memberId);

  const handleProductChange = (prodName: string) => {
    const p = LOAN_PRODUCTS.find(x => x.name === prodName);
    if (p) {
      setForm(f => ({
        ...f,
        productName: prodName,
        interestRate: String(p.defaultRate),
        installments: String(p.maxTerm),
      }));
    }
  };

  // Calculations
  const principal = parseFloat(form.principalAmount) || 0;
  const rate = (parseFloat(form.interestRate) || 0) / 100;
  const months = parseInt(form.installments) || 1;
  const interestAmount = Math.round(principal * rate * (months / 12));
  const totalAmount = principal + interestAmount;
  const installmentAmount = Math.ceil(totalAmount / months);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.memberId || principal <= 0) {
      alert('Please select a member and enter a valid loan amount');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: form.memberId,
          memberName: selectedMember?.name || form.memberName,
          productName: form.productName,
          principalAmount: principal,
          interestRate: parseFloat(form.interestRate),
          installments: months,
          installmentType: form.installmentType,
          branch: selectedMember?.branch || form.branch,
          purpose: form.purpose,
          guarantor: {
            name: form.guarantorName,
            mobile: form.guarantorMobile,
            nid: form.guarantorNid,
            relation: form.guarantorRelation,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to submit loan application');
        return;
      }

      alert('Loan application submitted successfully and placed in Loan Approvals queue!');
      router.push('/loans/approvals');
    } catch {
      alert('Network error while submitting loan application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Stage 2: Loan Application Submission"
        subtitle="Originate new member credit application with repayment simulations, guarantor verification, and approval routing."
        breadcrumbs={[
          { label: 'Loans', href: '/loans' },
          { label: 'Apply' },
        ]}
        action={
          <Link
            href="/loans/approvals"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <i className="fa-solid fa-list-check"></i>
            Go to Approval Queue
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Application Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-5">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Member Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Borrower Member *</label>
                <select
                  className={inputClass}
                  value={form.memberId}
                  onChange={e => {
                    const m = members.find(x => x._id === e.target.value);
                    setForm(f => ({
                      ...f,
                      memberId: e.target.value,
                      memberName: m?.name || '',
                      branch: m?.branch || f.branch,
                    }));
                  }}
                >
                  {members.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.accountNo}) - {m.branch} [Savings: ৳ {m.totalDeposit.toLocaleString()}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Member Quick Info Banner */}
              {selectedMember && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-blue-600 block">Category:</span>
                    <span className="font-bold text-slate-800">{selectedMember.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-600 block">Mobile:</span>
                    <span className="font-bold text-slate-800">{selectedMember.mobile}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-600 block">Passbook Savings:</span>
                    <span className="font-black text-emerald-700 font-mono">
                      ৳ {selectedMember.totalDeposit.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Loan Scheme & Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loan Product / Scheme *</label>
                  <select
                    className={inputClass}
                    value={form.productName}
                    onChange={e => handleProductChange(e.target.value)}
                  >
                    {LOAN_PRODUCTS.map(p => (
                      <option key={p.name} value={p.name}>
                        {p.name} ({p.defaultRate}% p.a.)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Requested Principal (৳) *</label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    className={inputClass}
                    value={form.principalAmount}
                    onChange={e => setForm(f => ({ ...f, principalAmount: e.target.value }))}
                  />
                </div>
              </div>

              {/* Interest, Term, Frequency */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    className={inputClass}
                    value={form.interestRate}
                    onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Installment Count (Tenure)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    className={inputClass}
                    value={form.installments}
                    onChange={e => setForm(f => ({ ...f, installments: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Installment Frequency</label>
                  <select
                    className={inputClass}
                    value={form.installmentType}
                    onChange={e => setForm(f => ({ ...f, installmentType: e.target.value }))}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Daily">Daily</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Purpose of Loan</label>
                <input
                  type="text"
                  placeholder="e.g. Agriculture equipment, shop renovation, dairy purchase"
                  className={inputClass}
                  value={form.purpose}
                  onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                />
              </div>

              {/* Guarantor Details */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5">
                  <i className="fa-solid fa-user-shield text-blue-600"></i>
                  Guarantor & Security Verification
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Guarantor Name</label>
                    <input
                      type="text"
                      placeholder="Guarantor full name"
                      className={inputClass}
                      value={form.guarantorName}
                      onChange={e => setForm(f => ({ ...f, guarantorName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Guarantor Mobile</label>
                    <input
                      type="text"
                      placeholder="017xxxxxxxx"
                      className={inputClass}
                      value={form.guarantorMobile}
                      onChange={e => setForm(f => ({ ...f, guarantorMobile: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Guarantor NID</label>
                    <input
                      type="text"
                      placeholder="NID card number"
                      className={inputClass}
                      value={form.guarantorNid}
                      onChange={e => setForm(f => ({ ...f, guarantorNid: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Relationship with Borrower</label>
                    <input
                      type="text"
                      placeholder="e.g. Brother, Colleague, Neighbor"
                      className={inputClass}
                      value={form.guarantorRelation}
                      onChange={e => setForm(f => ({ ...f, guarantorRelation: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/loans')}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || principal <= 0}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Loan Application'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Live Simulation Card */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 rounded-xl card-shadow space-y-4">
            <h3 className="font-black text-sm uppercase tracking-wider text-blue-200 border-b border-slate-700 pb-2 flex items-center gap-2">
              <i className="fa-solid fa-calculator text-amber-400"></i>
              Repayment Schedule Matrix
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Principal Disbursal:</span>
                <span className="font-bold text-white font-mono">৳ {principal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Total Calculated Interest:</span>
                <span className="font-bold text-amber-400 font-mono">+ ৳ {interestAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Total Repayable Amount:</span>
                <span className="font-black text-emerald-400 text-sm font-mono">৳ {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Tenure / Installments:</span>
                <span className="font-bold text-white">{months} {form.installmentType} installments</span>
              </div>
            </div>

            <div className="bg-blue-900/60 p-4 rounded-xl border border-blue-700 text-center space-y-1">
              <span className="text-[10px] font-bold text-blue-200 uppercase block">Installment Amount Due</span>
              <div className="text-2xl font-black text-white font-mono">৳ {installmentAmount.toLocaleString()}</div>
              <span className="text-[10px] text-blue-300">per {form.installmentType.toLowerCase()} cycle</span>
            </div>
          </div>

          {/* Policy Guidance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow text-xs space-y-2 text-slate-600">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <i className="fa-solid fa-circle-info text-blue-600"></i>
              Loan Approval Workflow
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
              <li>Submitted loan applications enter <strong>Stage 3: Loan Approvals</strong>.</li>
              <li>Branch Managers review KYC, credit history, and passbook collateral.</li>
              <li>Once authorized, the loan proceeds to <strong>Stage 4: Disbursement</strong> where cash or bank transfer is issued.</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
