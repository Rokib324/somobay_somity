'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { mockUsers } from '@/data/mockData';

export default function ManageUsersPage() {
  return (
    <AppLayout>
      <PageHeader
        title="User Access & Role Management"
        subtitle="Manage software operator accounts, role assignments, and login privileges."
        breadcrumbs={[{ label: 'Settings', href: '/settings' }, { label: 'Users' }]}
        action={
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg">
            + Create New User
          </button>
        }
      />

      <DataTable
        searchPlaceholder="Search User, Email, or Role..."
        columns={[
          { header: 'User ID', accessor: 'id', className: 'font-bold text-blue-600' },
          { header: 'Full Name', accessor: 'name', className: 'font-semibold text-slate-900' },
          { header: 'Email Address', accessor: 'email', className: 'text-slate-600 font-mono text-xs' },
          { header: 'Assigned Role', accessor: (item) => <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">{item.role}</span> },
          { header: 'Branch Location', accessor: 'branch', className: 'text-slate-500' },
          { header: 'Last Activity', accessor: 'lastLogin', className: 'text-slate-400 text-xs' },
          { header: 'Status', accessor: (item) => <Badge variant="success">{item.status}</Badge> },
        ]}
        data={mockUsers}
      />
    </AppLayout>
  );
}
