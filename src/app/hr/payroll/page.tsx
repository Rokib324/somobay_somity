'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

interface PayrollRow {
  empId: string;
  name: string;
  designation: string;
  branch: string;
  basicSalary: number;
  houseAllowance: number;
  medicalAllowance: number;
  grossSalary: number;
  providentFund: number;
  incomeTax: number;
  netSalary: number;
  status: string;
}

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<PayrollRow[]>([]);
  const [totalGross, setTotalGross] = useState(0);
  const [totalNet, setTotalNet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hr/payroll?month=${month}&year=${year}`);
      const data = await res.json();
      setPayroll(data.payroll ?? []);
      setTotalGross(data.totalGross ?? 0);
      setTotalNet(data.totalNet ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayroll(); }, [month, year]);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <AppLayout>
      <PageHeader
        title="Monthly Payroll Sheet"
        subtitle="Review and process salary disbursements for all active staff."
        breadcrumbs={[{ label: 'HR', href: '/hr/employees' }, { label: 'Payroll' }]}
        action={
          <div className="flex gap-2 items-center">
            <select
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
            </select>
            <button onClick={fetchPayroll} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg">
              Generate
            </button>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-semibold">Total Employees</p>
          <p className="text-xl font-black text-blue-700 mt-1">{payroll.length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs text-amber-600 font-semibold">Total Gross Salary</p>
          <p className="text-xl font-black text-amber-700 mt-1">৳ {totalGross.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <p className="text-xs text-emerald-600 font-semibold">Total Net Payable</p>
          <p className="text-xl font-black text-emerald-700 mt-1">৳ {totalNet.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">
              Payroll — {MONTHS[month - 1]} {year}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-3">Emp ID</th>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Designation</th>
                  <th className="py-3 px-3">Basic</th>
                  <th className="py-3 px-3">House</th>
                  <th className="py-3 px-3">Medical</th>
                  <th className="py-3 px-3 text-emerald-700">Gross</th>
                  <th className="py-3 px-3">PF</th>
                  <th className="py-3 px-3">Tax</th>
                  <th className="py-3 px-3 text-blue-700">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payroll.map(row => (
                  <tr key={row.empId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-purple-600">{row.empId}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{row.name}</td>
                    <td className="py-3 px-3 text-slate-500">{row.designation}</td>
                    <td className="py-3 px-3">৳ {row.basicSalary.toLocaleString()}</td>
                    <td className="py-3 px-3">৳ {row.houseAllowance.toLocaleString()}</td>
                    <td className="py-3 px-3">৳ {row.medicalAllowance.toLocaleString()}</td>
                    <td className="py-3 px-3 font-bold text-emerald-700">৳ {row.grossSalary.toLocaleString()}</td>
                    <td className="py-3 px-3 text-rose-500">-৳ {row.providentFund.toLocaleString()}</td>
                    <td className="py-3 px-3 text-rose-500">-৳ {row.incomeTax.toLocaleString()}</td>
                    <td className="py-3 px-3 font-black text-blue-700">৳ {row.netSalary.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                <tr>
                  <td colSpan={6} className="py-3 px-3 text-slate-700">Total</td>
                  <td className="py-3 px-3 text-emerald-700">৳ {totalGross.toLocaleString()}</td>
                  <td colSpan={2}></td>
                  <td className="py-3 px-3 text-blue-700">৳ {totalNet.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
