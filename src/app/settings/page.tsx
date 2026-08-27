'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function SettingsOverviewPage() {
  return (
    <AppLayout>
      <PageHeader
        title="General Society System Settings"
        subtitle="Configure cooperative society profile, logo, fiscal year defaults, and SMS API settings."
        breadcrumbs={[{ label: 'Settings' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-3xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); alert('Settings Saved'); }} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Cooperative Society Name</label>
            <input type="text" defaultValue="Somity Online Co-Operative Society Ltd." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Registration Reg No</label>
              <input type="text" defaultValue="REG-2022-9842" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fiscal Year Start</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold">
                <option>July 1 (Standard Bangladesh FY)</option>
                <option>January 1 (Calendar Year)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Head Office Address</label>
            <input type="text" defaultValue="Motijheel Commercial Area, Dhaka-1000" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" />
          </div>

          <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg">
            Save System Configurations
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
