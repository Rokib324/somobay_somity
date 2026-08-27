'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { mockMembers } from '@/data/mockData';

export default function MemberDetailsPage({ params }: { params: { id: string } }) {
  const member = mockMembers.find((m) => m.id === params.id) || mockMembers[0];

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
          <Badge variant="success">{member.status.toUpperCase()}</Badge>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-left">
            <div><span className="text-slate-400 font-medium">Father's Name:</span> <span className="font-bold text-slate-800">{member.fatherName}</span></div>
            <div><span className="text-slate-400 font-medium">Mother's Name:</span> <span className="font-bold text-slate-800">{member.motherName}</span></div>
            <div><span className="text-slate-400 font-medium">Mobile:</span> <span className="font-bold text-slate-800">{member.mobile}</span></div>
            <div><span className="text-slate-400 font-medium">NID:</span> <span className="font-bold text-slate-800 font-mono">{member.nid}</span></div>
            <div><span className="text-slate-400 font-medium">Joined Date:</span> <span className="font-bold text-slate-800">{member.joinDate}</span></div>
            <div><span className="text-slate-400 font-medium">Address:</span> <span className="font-bold text-slate-800">{member.address}</span></div>
          </div>
        </div>

        {/* Member Financial Accounts Overview */}
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

          <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Active Savings Accounts</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900">Daily Savings Account</h4>
                  <span className="text-slate-400 text-[10px]">Opened: Jan 16, 2022</span>
                </div>
                <span className="font-bold text-emerald-600 text-sm">৳ 45,000</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900">Monthly DPS (36 Months)</h4>
                  <span className="text-slate-400 text-[10px]">Monthly ৳ 2,000</span>
                </div>
                <span className="font-bold text-emerald-600 text-sm">৳ 1,00,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
