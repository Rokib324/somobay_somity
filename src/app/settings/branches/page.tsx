'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { mockBranches } from '@/data/mockData';
import { Badge } from '@/components/ui/Badge';

export default function BranchSetupPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Branch Office Management"
        subtitle="Configure physical branch locations, branch codes, managers, and assigned staff."
        breadcrumbs={[{ label: 'Settings', href: '/settings' }, { label: 'Branches' }]}
        action={
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg">
            + Create New Branch
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockBranches.map((br) => (
          <div key={br.id} className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{br.code}</span>
              <Badge variant="success">{br.status}</Badge>
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">{br.name}</h3>
            <div className="space-y-1 text-xs text-slate-600">
              <div>Manager: <span className="font-bold text-slate-800">{br.manager}</span></div>
              <div>Phone: <span className="font-bold text-slate-800">{br.phone}</span></div>
              <div>Address: <span className="text-slate-500">{br.address}</span></div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-bold text-emerald-600">
              {br.totalMembers} Active Society Members
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
