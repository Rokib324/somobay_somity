'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface DailyLog {
  _id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  notes?: string;
  workHours?: number;
}

interface MonthlyReportItem {
  employee: {
    _id: string;
    empId: string;
    name: string;
    designation: string;
    department: string;
    branch: string;
  };
  totalDutyDays: number;
  totalPresent: number;
  presentCount: number;
  lateCount: number;
  leaveCount: number;
  absentCount: number;
  records: DailyLog[];
}

export default function MonthlyAttendanceReportPage() {
  const [reports, setReports] = useState<MonthlyReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState('2026-09');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('all');
  const [expandedEmpId, setExpandedEmpId] = useState<string | null>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const fetchMonthlyData = async (m = month, emp = selectedEmpId) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month: m });
      if (emp !== 'all') params.append('empId', emp);

      const res = await fetch(`/api/hr/attendance?${params}`);
      const data = await res.json();
      setReports(data.monthlyReports || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyData(month, selectedEmpId);
  }, [month, selectedEmpId]);

  const handlePrint = () => {
    const content = printContainerRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Monthly Attendance Report - ${month}</title>
          <style>
            @page { size: landscape; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; color: #0f172a; margin: 0; padding: 10px; }
            .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px; }
            .title-main { font-size: 18px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; margin: 0; }
            .meta { font-size: 11px; color: #475569; margin-top: 3px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 10px; }
            th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
            td { border: 1px solid #cbd5e1; padding: 6px 8px; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .sig-row { display: flex; justify-content: space-between; margin-top: 50px; font-size: 10px; color: #475569; }
            .sig-line { border-top: 1px solid #64748b; width: 160px; text-align: center; padding-top: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title-main">Somity Online Multi-Purpose Cooperative Society Ltd.</h1>
            <div class="meta">
              <strong>Official HR Monthly Staff Attendance & Duty Matrix</strong> &nbsp;|&nbsp;
              <strong>Report Period:</strong> ${month} &nbsp;|&nbsp;
              <strong>Generated:</strong> ${new Date().toLocaleString()}
            </div>
          </div>
          ${content.innerHTML}
          <div class="sig-row">
            <div class="sig-line">Prepared By (HR Executive)</div>
            <div class="sig-line">Verified Head of HR</div>
            <div class="sig-line">Approved (Branch Manager)</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const selectedReport = selectedEmpId !== 'all' ? reports.find(r => r.employee._id === selectedEmpId) : null;

  return (
    <AppLayout>
      <PageHeader
        title="Monthly Attendance Summary & Detailed Timesheet"
        subtitle="Cumulative monthly attendance registers, check-in/out timestamps, duty days, late arrivals, and printable payroll report."
        breadcrumbs={[
          { label: 'HR', href: '/hr/employees' },
          { label: 'Attendance', href: '/hr/attendance' },
          { label: 'Monthly Report' },
        ]}
        action={
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-print"></i>
              Print Monthly Report
            </button>
            <Link
              href="/hr/attendance"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Back to Daily
            </Link>
          </div>
        }
      />

      {/* Filter Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 card-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Month Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Select Month</label>
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Employee Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Filter Staff Member</label>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-[220px]"
            >
              <option value="all">All Society Employees ({reports.length})</option>
              {reports.map(r => (
                <option key={r.employee._id} value={r.employee._id}>
                  {r.employee.empId} — {r.employee.name} ({r.employee.designation})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Showing metrics for <strong className="text-slate-900">{reports.length} staff members</strong>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div ref={printContainerRef} className="space-y-6">
          {/* Summary Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <i className="fa-solid fa-table text-blue-600"></i>
                Monthly Attendance Summary Matrix ({month})
              </h3>
              <span className="text-[11px] text-slate-400">Total Standard Workdays: 26</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Emp ID</th>
                    <th className="py-3 px-3">Staff Name</th>
                    <th className="py-3 px-3">Designation / Branch</th>
                    <th className="py-3 px-3 text-center">Duty Days</th>
                    <th className="py-3 px-3 text-center">Total Present</th>
                    <th className="py-3 px-3 text-center">Late Count</th>
                    <th className="py-3 px-3 text-center">Approved Leave</th>
                    <th className="py-3 px-3 text-center">Absent Days</th>
                    <th className="py-3 px-3 text-center">Attendance %</th>
                    <th className="py-3 px-3 text-center no-print">Timesheet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map(r => {
                    const pct = Math.round((r.totalPresent / r.totalDutyDays) * 100);
                    const isExpanded = expandedEmpId === r.employee._id;

                    return (
                      <React.Fragment key={r.employee._id}>
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-blue-600">{r.employee.empId}</td>
                          <td className="py-3 px-3 font-bold text-slate-900">{r.employee.name}</td>
                          <td className="py-3 px-3 text-slate-600">
                            <span>{r.employee.designation}</span>
                            <span className="text-[10px] text-slate-400 block">{r.employee.branch}</span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">{r.totalDutyDays}</td>
                          <td className="py-3 px-3 text-center font-extrabold text-emerald-600 text-sm">{r.totalPresent}</td>
                          <td className="py-3 px-3 text-center font-bold text-amber-600">{r.lateCount}</td>
                          <td className="py-3 px-3 text-center font-bold text-blue-600">{r.leaveCount}</td>
                          <td className="py-3 px-3 text-center font-bold text-rose-600">{r.absentCount}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${pct >= 90 ? 'bg-emerald-50 text-emerald-700' : pct >= 75 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                              {pct}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center no-print">
                            <button
                              onClick={() => setExpandedEmpId(isExpanded ? null : r.employee._id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-600 font-bold text-xs rounded transition-colors"
                            >
                              {isExpanded ? 'Hide Details' : 'View Timesheet'}
                            </button>
                          </td>
                        </tr>

                        {/* Detailed In/Out Timesheet Sub-Table */}
                        {(isExpanded || selectedEmpId === r.employee._id) && (
                          <tr>
                            <td colSpan={10} className="p-4 bg-slate-50/80 border-t border-b border-slate-200">
                              <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                    <i className="fa-solid fa-clock-rotate-left text-blue-600"></i>
                                    Daily Check-In & Check-Out Timesheet: {r.employee.name} ({r.employee.empId})
                                  </h4>
                                  <span className="text-[10px] text-slate-400">
                                    {r.records.length} logged punch events
                                  </span>
                                </div>

                                {r.records.length === 0 ? (
                                  <p className="text-slate-400 text-xs py-2 italic text-center">
                                    No daily attendance log records entered for this employee in {month}.
                                  </p>
                                ) : (
                                  <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px]">
                                        <th className="py-2 px-3">Date</th>
                                        <th className="py-2 px-3">Check-In Time</th>
                                        <th className="py-2 px-3">Check-Out Time</th>
                                        <th className="py-2 px-3">Status</th>
                                        <th className="py-2 px-3">Remarks / Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {r.records.map((rec, i) => (
                                        <tr key={rec._id || i} className="hover:bg-slate-50">
                                          <td className="py-2 px-3 font-medium text-slate-600">
                                            {new Date(rec.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                          </td>
                                          <td className="py-2 px-3 font-mono font-bold text-emerald-700">{rec.checkIn || '—'}</td>
                                          <td className="py-2 px-3 font-mono font-bold text-slate-700">{rec.checkOut || '—'}</td>
                                          <td className="py-2 px-3">
                                            <Badge variant={rec.status === 'Present' ? 'success' : rec.status === 'Late' ? 'warning' : 'danger'}>
                                              {rec.status}
                                            </Badge>
                                          </td>
                                          <td className="py-2 px-3 text-slate-400 text-[10px]">{rec.notes || '—'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
