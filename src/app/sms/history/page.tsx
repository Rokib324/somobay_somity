'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';

interface SMSRecord {
  _id: string;
  recipient: string;
  phone: string;
  message: string;
  type: string;
  status: 'Delivered' | 'Failed' | 'Pending';
  sentAt: string;
}

export default function SMSHistoryPage() {
  const [messages, setMessages] = useState<SMSRecord[]>([]);
  const [summary, setSummary] = useState<Array<{ _id: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchHistory = async (type = filter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (type) params.set('type', type);
      const res = await fetch(`/api/sms/history?${params}`);
      const data = await res.json();
      setMessages(data.messages ?? []);
      setSummary(data.summary ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const getCount = (status: string) => summary.find(s => s._id === status)?.count ?? 0;

  return (
    <AppLayout>
      <PageHeader
        title="SMS History & Logs"
        subtitle="View all sent SMS messages — transaction alerts, notifications, and bulk campaigns."
        breadcrumbs={[{ label: 'SMS', href: '/sms/history' }, { label: 'History' }]}
        action={
          <div className="flex gap-2">
            {['Transaction', 'Notification', 'Bulk'].map(t => (
              <button
                key={t}
                onClick={() => { setFilter(filter === t ? '' : t); fetchHistory(filter === t ? '' : t); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${filter === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-emerald-700">{getCount('Delivered')}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Delivered</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-rose-700">{getCount('Failed')}</p>
          <p className="text-xs text-rose-600 font-semibold mt-1">Failed</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-amber-700">{getCount('Pending')}</p>
          <p className="text-xs text-amber-600 font-semibold mt-1">Pending</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable
          searchPlaceholder="Search recipient or message..."
          columns={[
            { header: 'Recipient', accessor: 'recipient', className: 'font-semibold' },
            { header: 'Phone', accessor: 'phone', className: 'font-mono text-slate-500 text-xs' },
            { header: 'Message', accessor: (item: SMSRecord) => (
              <span className="line-clamp-2 text-slate-600 max-w-xs block">{item.message}</span>
            )},
            { header: 'Type', accessor: (item: SMSRecord) => <Badge variant="info">{item.type}</Badge> },
            { header: 'Status', accessor: (item: SMSRecord) => (
              <Badge variant={item.status === 'Delivered' ? 'success' : item.status === 'Failed' ? 'danger' : 'warning'}>
                {item.status}
              </Badge>
            )},
            { header: 'Sent At', accessor: (item: SMSRecord) => new Date(item.sentAt).toLocaleString('en-BD'), className: 'text-slate-400 text-xs' },
          ]}
          data={messages}
        />
      )}
    </AppLayout>
  );
}
