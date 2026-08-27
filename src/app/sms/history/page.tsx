'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { mockSMSHistory } from '@/data/mockData';

export default function SMSHistoryPage() {
  return (
    <AppLayout>
      <PageHeader
        title="SMS Delivery History & Audit Log"
        subtitle="Complete log of sent transactional and marketing SMS messages."
        breadcrumbs={[{ label: 'SMS', href: '/sms/history' }, { label: 'History Logs' }]}
      />

      <DataTable
        searchPlaceholder="Search recipient, mobile, or message..."
        columns={[
          { header: 'SMS ID', accessor: 'id', className: 'font-bold text-blue-600' },
          { header: 'Recipient Name', accessor: 'recipient', className: 'font-semibold text-slate-900' },
          { header: 'Mobile Number', accessor: 'phone', className: 'font-mono text-slate-600' },
          { header: 'Message Content', accessor: 'message', className: 'text-slate-600 max-w-xs truncate' },
          { header: 'Sent Timestamp', accessor: 'sentAt', className: 'text-slate-400 text-xs' },
          { header: 'Category', accessor: 'type', className: 'font-semibold text-slate-700' },
          { header: 'Status', accessor: (item) => <Badge variant="success">{item.status}</Badge> },
        ]}
        data={mockSMSHistory}
      />
    </AppLayout>
  );
}
