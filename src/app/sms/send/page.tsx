'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function SendSMSPage() {
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');

  return (
    <AppLayout>
      <PageHeader
        title="Send Single SMS"
        subtitle="Dispatch instant transaction alerts, reminders, or notifications to individual member mobiles."
        breadcrumbs={[{ label: 'SMS', href: '/sms/history' }, { label: 'Send SMS' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-2xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); alert('SMS Sent Successfully'); }} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Recipient Mobile Number</label>
            <input
              type="text"
              placeholder="017xxxxxxxx"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Message Body</label>
            <textarea
              rows={4}
              placeholder="Type message text..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            ></textarea>
            <p className="text-[10px] text-slate-400 mt-1 text-right">{message.length} Characters | {Math.ceil(message.length / 160) || 1} SMS Unit(s)</p>
          </div>

          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-md">
            Dispatch SMS Instant Gateway
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
