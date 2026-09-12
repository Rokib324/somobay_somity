'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';

interface AttendanceRecord {
  _id: string;
  empId: string;
  empCode: string;
  empName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Late' | 'Absent' | 'Leave' | 'Holiday';
  branch: string;
  notes?: string;
}

interface EmployeeItem {
  _id: string;
  empId: string;
  name: string;
  designation: string;
  branch?: string;
}

const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300';

export default function DailyAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Array<{ _id: string; count: number }>>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  // Mark Attendance Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [status, setStatus] = useState<'Present' | 'Late' | 'Absent' | 'Leave'>('Present');
  const [checkIn, setCheckIn] = useState('09:00 AM');
  const [checkOut, setCheckOut] = useState('05:00 PM');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAttendance = useCallback(async (d = date, q = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date: d });
      if (q.trim()) params.append('search', q);

      const res = await fetch(`/api/hr/attendance?${params}`);
      const data = await res.json();
      setAttendance(data.attendance ?? []);
      setSummary(data.summary ?? []);
    } finally {
      setLoading(false);
    }
  }, [date, search]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/hr/employees');
      const data = await res.json();
      const list = data.employees || [];
      setEmployees(list);
      if (list.length > 0) setSelectedEmpId(list[0]._id);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, [fetchAttendance]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    fetchAttendance(date, e.target.value);
  };

  const getCount = (st: string) => summary.find(s => s._id === st)?.count ?? 0;

  const handleSaveAttendance = async () => {
    const emp = employees.find(e => e._id === selectedEmpId);
    if (!emp) {
      alert('Please select an employee');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/hr/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empId: emp._id,
          empCode: emp.empId,
          empName: emp.name,
          date,
          checkIn: status === 'Absent' || status === 'Leave' ? undefined : checkIn,
          checkOut: status === 'Absent' || status === 'Leave' ? undefined : checkOut,
          status,
          branch: emp.branch || 'Main Branch',
          notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to mark attendance');
        return;
      }

      setIsModalOpen(false);
      fetchAttendance(date, search);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Daily Staff Attendance Log"
        subtitle="Real-time employee check-in times, late arrivals, absence tracking, and instant punch logging."
        breadcrumbs={[{ label: 'HR', href: '/hr/employees' }, { label: 'Attendance' }]}
        action={
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-user-check"></i>
              Mark Attendance
            </button>
            <input
              type="date"
              value={date}
              onChange={e => {
                setDate(e.target.value);
                fetchAttendance(e.target.value, search);
              }}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
            />
            <Link
              href="/hr/attendance/monthly"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-calendar-days"></i>
              Monthly Report
            </Link>
          </div>
        }
      />

      {/* Summary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Present Today', key: 'Present', color: 'emerald', icon: 'fa-solid fa-circle-check' },
          { label: 'Late Arrival', key: 'Late', color: 'amber', icon: 'fa-solid fa-clock' },
          { label: 'Absent Staff', key: 'Absent', color: 'rose', icon: 'fa-solid fa-circle-xmark' },
          { label: 'On Approved Leave', key: 'Leave', color: 'blue', icon: 'fa-solid fa-bed' },
        ].map(item => (
          <div key={item.key} className="bg-white border border-slate-200 rounded-xl p-4 card-shadow flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-900">{getCount(item.key)}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{item.label}</p>
            </div>
            <div className={`w-10 h-10 rounded-full bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center`}>
              <i className={item.icon}></i>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 mb-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search Employee by Name or Code..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold">
          Date: <span className="text-slate-800 font-bold">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Daily Attendance Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Emp Code</th>
                  <th className="py-3 px-4">Staff Name</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Check-Out Time</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map(att => (
                  <tr key={att._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{att.empCode}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{att.empName}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">{att.checkIn || '—'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{att.checkOut || '—'}</td>
                    <td className="py-3 px-4 text-slate-500">{att.branch}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">{att.notes || '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={att.status === 'Present' ? 'success' : att.status === 'Late' ? 'warning' : 'danger'}>
                        {att.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <i className="fa-solid fa-users-slash text-2xl mb-2 text-slate-300 block"></i>
                      No attendance logged for {new Date(date).toLocaleDateString()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Daily Attendance Entry"
        footer={
          <div className="flex justify-between w-full">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg text-xs hover:bg-slate-200">
              Cancel
            </button>
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving Entry...' : 'Save Attendance'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Staff Member *</label>
            <select
              className={inputClass}
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
            >
              {employees.map(e => (
                <option key={e._id} value={e._id}>
                  {e.empId} — {e.name} ({e.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Attendance Status</label>
              <select className={inputClass} value={status} onChange={e => setStatus(e.target.value as any)}>
                <option value="Present">Present (On-Time)</option>
                <option value="Late">Late Arrival</option>
                <option value="Absent">Absent</option>
                <option value="Leave">On Approved Leave</option>
              </select>
            </div>
          </div>

          {(status === 'Present' || status === 'Late') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Check-In Time</label>
                <input type="text" placeholder="09:00 AM" className={inputClass} value={checkIn} onChange={e => setCheckIn(e.target.value)} />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Check-Out Time</label>
                <input type="text" placeholder="05:00 PM" className={inputClass} value={checkOut} onChange={e => setCheckOut(e.target.value)} />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Remarks / Justification</label>
            <textarea rows={2} placeholder="Optional late arrival reason or field duty notice" className={inputClass} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
