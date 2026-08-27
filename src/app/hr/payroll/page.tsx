'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { mockEmployees } from '@/data/mockData';

export default function PayrollSalaryPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Staff Payroll & Monthly Salary Sheet"
        subtitle="Process monthly salaries, calculate allowances, performance bonuses, and deductions."
        breadcrumbs={[{ label: 'HR', href: '/hr/employees' }, { label: 'Payroll' }]}
        action={
          <button onClick={() => alert('Monthly Payroll Generated')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm">
            Process Payroll Voucher
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Emp ID</th>
                <th className="py-3 px-4">Staff Name</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4 text-right">Basic Salary (৳)</th>
                <th className="py-3 px-4 text-right">Allowances (৳)</th>
                <th className="py-3 px-4 text-right">Net Payable (৳)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{emp.empId}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{emp.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{emp.designation}</td>
                  <td className="py-3.5 px-4 text-right font-medium">৳ {emp.salary.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right font-medium text-emerald-600">৳ 5,000</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">৳ {(emp.salary + 5000).toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[11px]">
                      Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
