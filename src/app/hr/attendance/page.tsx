'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface AttendanceRecord {
  _id: string;
  empCode: string;
  empName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Late' | 'Absent' | 'Leave' | 'Holiday';
  branch: string;
}

export default function DailyAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Array<{ _id: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchAttendance = async (d = date) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hr/attendance?date=${d}`);
      const data = await res.json();
      setAttendance(data.attendance ?? []);
      setSummary(data.summary ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const getCount = (status: string) => summary.find(s => s._id === status)?.count ?? 0;

  return (
    <AppLayout>
      <PageHeader
        title="Daily Staff Attendance Log"
        subtitle="Real-time employee check-in times, late arrivals, and departure logs."
        breadcrumbs={[{ label: 'HR', href: '/hr/employees' }, { label: 'Attendance' }]}
        action={
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); fetchAttendance(e.target.value); }}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
            <Link href="/hr/attendance/monthly" className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm">
              Monthly Summary
            </Link>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Present', key: 'Present', color: 'emerald' },
          { label: 'Late', key: 'Late', color: 'amber' },
          { label: 'Absent', key: 'Absent', color: 'rose' },
          { label: 'Leave', key: 'Leave', color: 'blue' },
        ].map(item => (
          <div key={item.key} className={`bg-${item.color}-50 border border-${item.color}-100 rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-black text-${item.color}-700`}>{getCount(item.key)}</p>
            <p className={`text-xs font-semibold text-${item.color}-600 mt-1`}>{item.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Emp ID</th>
                  <th className="py-3 px-4">Staff Name</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map(att => (
                  <tr key={att._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{att.empCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{att.empName}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(att.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{att.checkIn || '—'}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{att.checkOut || '—'}</td>
                    <td className="py-3 px-4 text-slate-500">{att.branch}</td>
                    <td className="py-3 px-4">
                      <Badge variant={att.status === 'Present' ? 'success' : att.status === 'Late' ? 'warning' : 'danger'}>
                        {att.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-slate-400">No attendance records for this date</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
