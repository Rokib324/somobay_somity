'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import Link from 'next/link';

interface SMSSummary {
  delivered: number;
  failed: number;
  total: number;
}

const TEMPLATES = [
  { label: 'Loan Reminder', text: 'Dear [Name], your loan installment of ৳[Amount] is due. Please pay by [Date]. Thank you. - Somity' },
  { label: 'Savings Receipt', text: 'Dear [Name], your deposit of ৳[Amount] has been received. Current balance: ৳[Balance]. - Somity' },
  { label: 'Meeting Notice', text: 'Dear Member, there is a society meeting on [Date] at [Time]. Your presence is requested. - Somity' },
  { label: 'Overdue Warning', text: 'Dear [Name], your loan account has an overdue amount of ৳[Amount]. Pay immediately to avoid penalty. - Somity' },
];

export default function SendSMSPage() {
  const [mobile, setMobile] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('Notification');
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  const [summary, setSummary] = useState<SMSSummary>({ delivered: 0, failed: 0, total: 0 });

  useEffect(() => {
    fetch('/api/sms/send')
      .then(r => r.json())
      .then(d => {
        const s = d.summary ?? [];
        const delivered = s.find((x: { _id: string; count: number }) => x._id === 'Delivered')?.count ?? 0;
        const failed = s.find((x: { _id: string; count: number }) => x._id === 'Failed')?.count ?? 0;
        setSummary({ delivered, failed, total: delivered + failed });
      });
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || !message || !recipient) {
      alert('Recipient name, mobile, and message are required');
      return;
    }
    setSending(true);
    setLastResult(null);
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, phone: mobile, message, type }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const status = data.records?.[0]?.status ?? 'Delivered';
        setLastResult({ success: status === 'Delivered', message: `SMS ${status === 'Delivered' ? 'delivered' : 'failed'} to ${mobile}` });
        setSummary(prev => ({
          ...prev,
          delivered: status === 'Delivered' ? prev.delivered + 1 : prev.delivered,
          failed: status === 'Failed' ? prev.failed + 1 : prev.failed,
          total: prev.total + 1,
        }));
        setMobile('');
        setMessage('');
        setRecipient('');
      } else {
        setLastResult({ success: false, message: data.error || 'Failed to send SMS' });
      }
    } finally {
      setSending(false);
    }
  };

  const smsUnits = Math.ceil(message.length / 160) || 1;

  return (
    <AppLayout>
      <PageHeader
        title="Send Single SMS"
        subtitle="Dispatch instant transaction alerts, reminders, or notifications to individual member mobiles."
        breadcrumbs={[{ label: 'SMS', href: '/sms/history' }, { label: 'Send SMS' }]}
        action={
          <Link href="/sms/history" className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors">
            <i className="fa-solid fa-clock-rotate-left mr-1.5" />SMS History
          </Link>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-blue-700">{summary.total}</p>
          <p className="text-xs font-semibold text-blue-600 mt-1">Total Sent</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-emerald-700">{summary.delivered}</p>
          <p className="text-xs font-semibold text-emerald-600 mt-1">Delivered</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-rose-700">{summary.failed}</p>
          <p className="text-xs font-semibold text-rose-600 mt-1">Failed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 card-shadow">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <i className="fa-solid fa-paper-plane text-blue-600" />
            Compose SMS
          </h3>

          {lastResult && (
            <div className={`mb-4 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${lastResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
              <i className={`fa-solid ${lastResult.success ? 'fa-circle-check' : 'fa-circle-xmark'}`} />
              {lastResult.message}
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Recipient Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Karim Hossain"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="text"
                  placeholder="017xxxxxxxx"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">SMS Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                {['Transaction', 'Notification', 'Bulk', 'Reminder', 'Alert'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Message Body *</label>
              <textarea
                rows={4}
                placeholder="Type message text..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs resize-none"
              />
              <p className="text-[10px] text-slate-400 mt-1 text-right">
                {message.length} Characters | {smsUnits} SMS Unit{smsUnits !== 1 ? 's' : ''}
              </p>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-md transition-colors disabled:opacity-60"
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </span>
              ) : 'Dispatch SMS via Gateway'}
            </button>
          </form>
        </div>

        {/* Templates */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <i className="fa-solid fa-file-lines text-slate-500" />
            Quick Templates
          </h3>
          <div className="space-y-3">
            {TEMPLATES.map(t => (
              <button
                key={t.label}
                onClick={() => setMessage(t.text)}
                className="w-full text-left p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors group"
              >
                <p className="font-bold text-xs text-slate-800 group-hover:text-blue-700 mb-1">{t.label}</p>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{t.text}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
