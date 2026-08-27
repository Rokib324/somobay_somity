'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function ApplyLeavePage() {
  return (
    <AppLayout>
      <PageHeader
        title="Submit Leave Requisition"
        subtitle="Apply for employee leave with automated balance validation."
        breadcrumbs={[{ label: 'HR', href: '/hr/employees' }, { label: 'Leave', href: '/hr/leave/list' }, { label: 'Apply' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-2xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); alert('Leave Application Submitted'); }} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Employee</label>
            <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold">
              <option>E-101 — Tariqul Islam (Senior Accountant)</option>
              <option>E-102 — Mahmuda Begum (Field Officer)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Leave Type</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <option>Casual Leave (CL)</option>
                <option>Sick Leave (SL)</option>
                <option>Earned Leave (EL)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Days</label>
              <input type="number" defaultValue={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Date</label>
              <input type="date" defaultValue="2026-08-25" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Date</label>
              <input type="date" defaultValue="2026-08-26" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason / Notes</label>
            <textarea rows={3} placeholder="Provide details..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"></textarea>
          </div>

          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-md">
            Submit Application
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
