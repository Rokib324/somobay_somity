'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { use } from 'react';

interface Member {
  _id: string;
  accountNo: string;
  name: string;
  fatherName: string;
  motherName: string;
  mobile: string;
  nid: string;
  category: string;
  branch: string;
  joinDate: string;
  address: string;
  status: 'active' | 'inactive' | 'pending';
  totalDeposit: number;
  totalLoan: number;
}

interface DepositAccount {
  _id: string;
  accountNo: string;
  type: string;
  amount: number;
  balance: number;
  interestRate: number;
  openingDate: string;
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
        subtitle={`Account No: ${member.accountNo} | Category: ${member.category}`}
        breadcrumbs={[{ label: 'Members', href: '/members' }, { label: member.name }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4 text-center">
          <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 font-extrabold text-3xl flex items-center justify-center mx-auto shadow-md">
            {member.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">{member.name}</h3>
            <span className="font-mono text-xs text-blue-600 font-bold block mt-0.5">{member.accountNo}</span>
          </div>
          <Badge variant={member.status === 'active' ? 'success' : 'warning'}>{member.status.toUpperCase()}</Badge>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-left">
            <div><span className="text-slate-400 font-medium">Father's Name:</span> <span className="font-bold text-slate-800">{member.fatherName}</span></div>
            <div><span className="text-slate-400 font-medium">Mother's Name:</span> <span className="font-bold text-slate-800">{member.motherName}</span></div>
            <div><span className="text-slate-400 font-medium">Mobile:</span> <span className="font-bold text-slate-800">{member.mobile}</span></div>
            <div><span className="text-slate-400 font-medium">NID:</span> <span className="font-bold text-slate-800 font-mono">{member.nid}</span></div>
            <div><span className="text-slate-400 font-medium">Branch:</span> <span className="font-bold text-slate-800">{member.branch}</span></div>
            <div><span className="text-slate-400 font-medium">Joined:</span> <span className="font-bold text-slate-800">{new Date(member.joinDate).toLocaleDateString()}</span></div>
            <div><span className="text-slate-400 font-medium">Address:</span> <span className="font-bold text-slate-800">{member.address}</span></div>
          </div>
        </div>

        {/* Financial Accounts Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase">Total Deposit Balance</span>
              <h2 className="text-2xl font-black text-emerald-900">৳ {member.totalDeposit.toLocaleString()}</h2>
            </div>
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-amber-700 uppercase">Active Loan Due</span>
              <h2 className="text-2xl font-black text-amber-900">৳ {member.totalLoan.toLocaleString()}</h2>
            </div>
          </div>

          {/* Deposit Accounts */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <i className="fa-solid fa-piggy-bank text-emerald-600"></i>
              Savings Accounts ({deposits.length})
            </h3>
            <div className="space-y-3 text-xs">
              {deposits.length === 0 && <p className="text-slate-400 text-center py-4">No savings accounts</p>}
              {deposits.map(dep => (
                <div key={dep._id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900">{dep.type}</h4>
                    <span className="text-slate-400 text-[10px]">Opened: {new Date(dep.openingDate).toLocaleDateString()} | Rate: {dep.interestRate}%</span>
                  </div>
                  <span className="font-bold text-emerald-600 text-sm">৳ {dep.balance.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Loan Accounts */}
          {loans.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <i className="fa-solid fa-hand-holding-dollar text-amber-600"></i>
                Loan Accounts ({loans.length})
              </h3>
              <div className="space-y-3 text-xs">
                {loans.map(loan => (
                  <div key={loan._id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900">{loan.loanNo} — {loan.productName}</h4>
                      <span className="text-slate-400 text-[10px]">Principal: ৳ {loan.principalAmount.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-600 text-sm block">৳ {loan.dueAmount.toLocaleString()} due</span>
                      <Badge variant={loan.status === 'active' ? 'success' : 'warning'}>{loan.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
