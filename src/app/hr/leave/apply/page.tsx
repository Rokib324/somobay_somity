'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useRouter } from 'next/navigation';

interface Employee {
  _id: string;
  empId: string;
  name: string;
  designation: string;
  branch: string;
}

const LEAVE_TYPES = ['Casual', 'Sick', 'Annual', 'Maternity', 'Unpaid'];
const inputClass = 'w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300';

export default function ApplyLeavePage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    empId: '' as string,  // ObjectId
    empCode: '',          // empId string like EMP-001
    empName: '',
    leaveType: 'Casual',
    fromDate: today,
    toDate: tomorrow,
    reason: '',
    branch: '',
  });

  useEffect(() => {
    fetch('/api/hr/employees?status=active&limit=100')
      .then(r => r.json())
      .then(d => {
        const emps = d.employees ?? [];
        setEmployees(emps);
        if (emps.length > 0) {
          setForm(f => ({ ...f, empId: emps[0]._id, empCode: emps[0].empId, empName: emps[0].name, branch: emps[0].branch }));
        }
      });
  }, []);

  const handleEmployeeChange = (empObjectId: string) => {
    const emp = employees.find(e => e._id === empObjectId);
    setForm(f => ({ ...f, empId: emp?._id ?? '', empCode: emp?.empId ?? '', empName: emp?.name ?? '', branch: emp?.branch ?? '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.empId || !form.fromDate || !form.toDate) {
      alert('Employee and dates are required');
      return;
    }
    if (form.toDate < form.fromDate) {
      alert('End date cannot be before start date');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/hr/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to submit leave application');
        return;
      }
      alert('Leave application submitted successfully');
      router.push('/hr/leave/list');
    } finally {
      setSaving(false);
    }
  };

  const days = form.fromDate && form.toDate
    ? Math.ceil((new Date(form.toDate).getTime() - new Date(form.fromDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  return (
    <AppLayout>
      <PageHeader
        title="Submit Leave Requisition"
        subtitle="Apply for employee leave with automated balance validation."
        breadcrumbs={[{ label: 'HR', href: '/hr/employees' }, { label: 'Leave', href: '/hr/leave/list' }, { label: 'Apply' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Employee *</label>
            <select className={inputClass} value={form.empId} onChange={e => handleEmployeeChange(e.target.value)}>
              <option value="">-- Select Employee --</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.empId}) — {emp.designation}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Leave Type *</label>
              <select className={inputClass} value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}>
                {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Days</label>
              <div className={`${inputClass} bg-blue-50 border-blue-100 font-black text-blue-700`}>
                {days > 0 ? `${days} day${days !== 1 ? 's' : ''}` : '—'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
              <input type="date" className={inputClass} value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Date *</label>
              <input type="date" className={inputClass} value={form.toDate} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} min={form.fromDate} />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason / Notes</label>
            <textarea
              rows={3}
              placeholder="Provide details for leave request..."
              className={inputClass}
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.push('/hr/leave/list')} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors disabled:opacity-60">
              {saving ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
