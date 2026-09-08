'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

interface Branch {
  _id: string;
  code: string;
  name: string;
  manager: string;
  phone?: string;
  address: string;
  status: 'active' | 'inactive';
  totalMembers: number;
}

export default function CostCenterPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/branches')
      .then((res) => res.json())
      .then((data) => setBranches(data.branches || []))
      .catch(() => setBranches([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <PageHeader
        title="Cost Center Management"
        subtitle="Track departmental and branch-wise expense allocations and financial accountability."
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Cost Center' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">Active Cost Centers</h3>
          <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg">
            + New Cost Center
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm">
              Loading cost centers...
            </div>
          ) : branches.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm">
              No cost centers found
            </div>
          ) : (
            branches.map((branch) => (
              <div key={branch._id} className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {branch.code}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${branch.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{branch.name}</h4>
                <p className="text-xs text-slate-500">{branch.address}</p>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-semibold text-slate-700">
                  <span>Manager: {branch.manager}</span>
                  <span>{branch.totalMembers ?? 0} Members</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
