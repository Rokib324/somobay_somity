'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface Employee {
  _id: string;
  empId: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email?: string;
  salary: number;
  branch: string;
  status: 'active' | 'on_leave' | 'terminated';
  joinDate: string;
}

const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300';

const DEPARTMENTS = ['Management', 'Accounts', 'Operations', 'Field', 'IT', 'HR'];
const DESIGNATIONS = ['General Manager', 'Branch Manager', 'Senior Accountant', 'Accountant', 'Field Officer', 'Data Entry Operator', 'Guard'];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalSalary, setTotalSalary] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '', designation: 'Field Officer', department: 'Operations',
    phone: '', email: '', salary: '', branch: '', status: 'active',
  });

  const fetchEmployees = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: q, limit: '30' });
      const res = await fetch(`/api/hr/employees?${params}`);
      const data = await res.json();
      setEmployees(data.employees ?? []);
      setTotalSalary(data.totalMonthlySalary ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetch('/api/settings/branches').then(r => r.json()).then(d => {
      const names = (d.branches ?? []).map((b: { name: string }) => b.name);
      setBranches(names);
      if (names.length) setForm(f => ({ ...f, branch: names[0] }));
    });
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.salary) {
      alert('Name, Phone, and Salary are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, salary: Number(form.salary) }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to add employee');
        return;
      }
      setIsModalOpen(false);
      setForm({ name: '', designation: 'Field Officer', department: 'Operations', phone: '', email: '', salary: '', branch: branches[0] || '', status: 'active' });
      fetchEmployees();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="HR — Employee Directory"
        subtitle="Manage staff records, designations, branches, and employment status."
        breadcrumbs={[{ label: 'HR', href: '/hr/employees' }, { label: 'Employees' }]}
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <i className="fa-solid fa-user-plus mr-1.5"></i>Add Employee
          </button>
        }
      />

      {/* Summary Banner */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <p className="text-xs text-purple-600 font-semibold">Total Active Staff</p>
          <p className="text-xl font-black text-purple-700 mt-1">{employees.filter(e => e.status === 'active').length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-semibold">Total Employees</p>
          <p className="text-xl font-black text-blue-700 mt-1">{employees.length}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <p className="text-xs text-emerald-600 font-semibold">Monthly Salary Bill</p>
          <p className="text-xl font-black text-emerald-700 mt-1">৳ {totalSalary.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable
          searchPlaceholder="Search by name, ID, or designation..."
          onSearch={fetchEmployees}
          columns={[
            { header: 'Employee ID', accessor: 'empId', className: 'font-bold text-purple-600' },
            { header: 'Full Name', accessor: 'name', className: 'font-semibold text-slate-900' },
            { header: 'Designation', accessor: 'designation', className: 'text-slate-700' },
            { header: 'Department', accessor: 'department', className: 'text-slate-500' },
            { header: 'Phone', accessor: 'phone', className: 'text-slate-600' },
            { header: 'Branch', accessor: 'branch', className: 'text-slate-500' },
            { header: 'Monthly Salary', accessor: (item: Employee) => `৳ ${item.salary.toLocaleString()}`, className: 'font-bold text-emerald-700' },
            {
              header: 'Status',
              accessor: (item: Employee) => (
                <Badge variant={item.status === 'active' ? 'success' : item.status === 'on_leave' ? 'warning' : 'danger'}>
                  {item.status.replace('_', ' ')}
                </Badge>
              ),
            },
          ]}
          data={employees}
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Employee"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs disabled:opacity-60">
              {saving ? 'Saving...' : 'Add Employee'}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input type="text" className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone *</label>
              <input type="text" className={inputClass} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Designation</label>
              <select className={inputClass} value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}>
                {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <select className={inputClass} value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Monthly Salary (৳) *</label>
              <input type="number" className={inputClass} value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch</label>
              <select className={inputClass} value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}>
                {branches.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email</label>
            <input type="email" className={inputClass} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
