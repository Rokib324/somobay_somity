'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function BulkSMSPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Broadcast Bulk SMS Campaign"
        subtitle="Send group notifications to all members, specific categories, or overdue borrowers."
        breadcrumbs={[{ label: 'SMS', href: '/sms/history' }, { label: 'Bulk Campaign' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-2xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); alert('Bulk Campaign Queued'); }} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Recipient Group</label>
            <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <option>All Active Members (2,960 Members)</option>
              <option>Uttara Branch Members (890 Members)</option>
              <option>Overdue Loan Borrowers Only</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Campaign Message</label>
            <textarea rows={4} placeholder="Type broadcast announcement..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"></textarea>
          </div>

          <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-md">
            Broadcast Bulk SMS to Queue
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
