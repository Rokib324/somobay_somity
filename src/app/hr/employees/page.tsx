'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { mockEmployees } from '@/data/mockData';
import Link from 'next/link';

export default function EmployeesListPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Employee Directory & Staff List"
        subtitle="Manage staff designations, department assignments, mobile contacts, and monthly salaries."
        breadcrumbs={[{ label: 'HR', href: '/hr/employees' }, { label: 'Employees' }]}
        action={
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm">
              + Add New Staff
            </button>
            <Link href="/hr/payroll" className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm">
              Payroll Processing
            </Link>
          </div>
        }
      />

      <DataTable
        searchPlaceholder="Search Employee ID, Name, or Designation..."
        columns={[
          { header: 'Emp ID', accessor: 'empId', className: 'font-bold text-blue-600' },
          { header: 'Employee Name', accessor: 'name', className: 'font-semibold text-slate-900' },
          { header: 'Designation', accessor: 'designation', className: 'text-slate-700 font-medium' },
          { header: 'Department', accessor: 'department', className: 'text-slate-500' },
          { header: 'Phone Number', accessor: 'phone', className: 'text-slate-600' },
          { header: 'Monthly Salary', accessor: (item) => `৳ ${item.salary.toLocaleString()}`, className: 'font-bold text-slate-800' },
          {
            header: 'Status',
            accessor: (item) => <Badge variant={item.status === 'active' ? 'success' : 'neutral'}>{item.status}</Badge>,
          },
        ]}
        data={mockEmployees}
      />
    </AppLayout>
  );
}
