'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function AddMenuPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Add Dynamic Navigation Menu Item"
        subtitle="Register custom dynamic navigation routes and font-awesome icons into ERP sidebar."
        breadcrumbs={[{ label: 'Settings', href: '/settings' }, { label: 'Add Menu' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-2xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); alert('Menu Item Added'); }} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Menu Title</label>
            <input type="text" placeholder="e.g. Audit Logs" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Route URL Path</label>
            <input type="text" placeholder="e.g. /audit-logs" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">FontAwesome Icon Class</label>
            <input type="text" placeholder="e.g. fa-solid fa-clipboard-check" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono" />
          </div>

          <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg">
            Register New Menu Route
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
