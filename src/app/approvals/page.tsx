'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type ApprovalType = 'member' | 'withdrawal' | 'loan' | 'voucher' | 'transaction' | 'leave' | 'manual_attendance';
type ApprovalStage =
  | 'secretary' | 'vice_chairman' | 'chairman' | 'completed'
  | 'loan_committee_head' | 'director_head'
  | 're_committee_head' | 'supervisor_committee_head'
  | 'employer_head' | 'hr_director';

interface ApprovalStep {
  stage: ApprovalStage;
  action: 'approved' | 'rejected';
  actionBy: string;
  actionByRole: string;
  notes?: string;
  actionAt: string;
}

interface ApprovalItem {
  _id: string;
  approvalNo: string;
  type: ApprovalType;
  title: string;
  description?: string;
  entityId: string;
  entityModel: string;
  referenceNo?: string;
  memberId?: string;
  memberName?: string;
  memberAccountNo?: string;
  empId?: string;
  empName?: string;
  empCode?: string;
  department?: string;
  amount?: number;
  branch: string;
  status: 'pending' | 'approved' | 'rejected';
  currentStage: ApprovalStage;
  steps: ApprovalStep[];
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedByRole?: string;
  rejectedAt?: string;
  finalApprovedBy?: string;
  finalApprovedAt?: string;
  submittedBy: string;
  submittedAt: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

interface ApprovalStats {
  myActionCount: number;
  pendingMembers: number;
  pendingTransactions: number;
  pendingLoans: number;
  pendingLeaves: number;
  pendingAttendance: number;
  totalPending: number;
  completedCount: number;
  rejectedCount: number;
}

// ─── Workflow Chains ──────────────────────────────────────────────────────────

/**
 * Returns ordered stages for a given type.
 */
function getWorkflowStages(type: ApprovalType): { stage: ApprovalStage; label: string }[] {
  switch (type) {
    case 'loan':
      return [
        { stage: 'loan_committee_head', label: 'Loan Committee Head' },
        { stage: 'director_head',       label: 'Director Head' },
        { stage: 'secretary',           label: 'Secretary' },
        { stage: 'chairman',            label: 'Chairman' },
      ];
    case 'voucher':
      return [
        { stage: 're_committee_head',          label: 'Re-Committee Head' },
        { stage: 'supervisor_committee_head',  label: 'Supervisor Committee Head' },
        { stage: 'secretary',                  label: 'Secretary' },
        { stage: 'chairman',                   label: 'Chairman' },
      ];
    case 'leave':
    case 'manual_attendance':
      return [
        { stage: 'employer_head', label: 'Employer Head / Supervisor' },
        { stage: 'hr_director',   label: 'Director / HR' },
        { stage: 'chairman',      label: 'Chairman' },
      ];
    default:
      // member, withdrawal, transaction
      return [
        { stage: 'secretary',     label: 'Secretary' },
        { stage: 'vice_chairman', label: 'Vice Chairman' },
        { stage: 'chairman',      label: 'Chairman' },
      ];
  }
}

/**
 * Roles that can act at each stage.
 */
const STAGE_ROLE_MAP: Record<ApprovalStage, string[]> = {
  'secretary':                 ['Secretary'],
  'vice_chairman':             ['Vice Chairman'],
  'chairman':                  ['Chairman', 'Super Admin'],
  'completed':                 [],
  'loan_committee_head':       ['Loan Committee Head'],
  'director_head':             ['Director Head'],
  're_committee_head':         ['Re-committee Head'],
  'supervisor_committee_head': ['Supervisor Committee Head'],
  'employer_head':             ['Employer Head', 'Supervisor'],
  'hr_director':               ['HR Director', 'HR', 'Director'],
};

/**
 * Tabs visible to each role.
 */
const ROLE_TABS_MAP: Record<string, string[]> = {
  'Secretary':                 ['my_queue', 'members', 'transactions', 'loans', 'all', 'history'],
  'Vice Chairman':             ['my_queue', 'members', 'transactions', 'all', 'history'],
  'Chairman':                  ['my_queue', 'members', 'transactions', 'loans', 'leave', 'manual_attendance', 'all', 'history'],
  'Super Admin':               ['my_queue', 'members', 'transactions', 'loans', 'leave', 'manual_attendance', 'all', 'history'],
  'Loan Committee Head':       ['my_queue', 'loans', 'all', 'history'],
  'Director Head':             ['my_queue', 'loans', 'all', 'history'],
  'Re-committee Head':         ['my_queue', 'transactions', 'all', 'history'],
  'Supervisor Committee Head': ['my_queue', 'transactions', 'all', 'history'],
  'Employer Head':             ['my_queue', 'leave', 'manual_attendance', 'all', 'history'],
  'Supervisor':                ['my_queue', 'leave', 'manual_attendance', 'all', 'history'],
  'HR Director':               ['my_queue', 'leave', 'manual_attendance', 'all', 'history'],
  'HR':                        ['my_queue', 'leave', 'manual_attendance', 'all', 'history'],
  'Director':                  ['my_queue', 'leave', 'manual_attendance', 'all', 'history'],
};

function getRoleTabs(role?: string): string[] {
  if (!role) return ['my_queue'];
  return ROLE_TABS_MAP[role] || ['my_queue'];
}

// ─── Main Component ───────────────────────────────────────────────────────────

function ApprovalsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'my_queue';
  const { user } = useAuth();
  const [, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [stats, setStats] = useState<ApprovalStats>({
    myActionCount: 0, pendingMembers: 0, pendingTransactions: 0,
    pendingLoans: 0, pendingLeaves: 0, pendingAttendance: 0,
    totalPending: 0, completedCount: 0, rejectedCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const allowedTabs = getRoleTabs(user?.role);

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('tab', activeTab);
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      if (stageFilter) params.set('stage', stageFilter);

      const res = await fetch(`/api/approvals?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApprovals(data.approvals || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, typeFilter, stageFilter]);

  useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== activeTab) setActiveTab(urlTab);
  }, [searchParams, activeTab]);

  const canUserActOnItem = (item: ApprovalItem): boolean => {
    if (!user || item.status !== 'pending') return false;
    const allowedRoles = STAGE_ROLE_MAP[item.currentStage] || [];
    return allowedRoles.includes(user.role);
  };

  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!selectedItem) return;
    if (action === 'rejected' && !reviewNotes.trim()) {
      alert('Please specify a rejection reason for audit records.');
      return;
    }
    const confirmMsg = action === 'approved'
      ? (selectedItem.currentStage === 'chairman' ? 'Grant FINAL APPROVAL? This will activate/execute the request.' : 'Approve and advance to the next stage?')
      : 'REJECT this request? The workflow will terminate immediately.';
    if (!confirm(confirmMsg)) return;

    setProcessingAction(true);
    try {
      const res = await fetch(`/api/approvals/${selectedItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes: reviewNotes.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Action failed'); return; }
      setReviewModalOpen(false);
      setSelectedItem(null);
      setReviewNotes('');
      await fetchApprovals();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setProcessingAction(false);
    }
  };

  // ─── Badge renderers ─────────────────────────────────────────────────────

  const getStatusBadge = (item: ApprovalItem) => {
    if (item.status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <i className="fa-solid fa-circle-xmark text-rose-500" /> Rejected
        </span>
      );
    }
    if (item.status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <i className="fa-solid fa-circle-check text-emerald-500" /> Fully Approved
        </span>
      );
    }
    const stageLabels: Record<string, { label: string; color: string }> = {
      secretary:                 { label: 'Pending Secretary',            color: 'amber' },
      vice_chairman:             { label: 'Pending Vice Chairman',        color: 'purple' },
      chairman:                  { label: 'Pending Chairman',             color: 'blue' },
      loan_committee_head:       { label: 'Pending Loan Committee Head',  color: 'orange' },
      director_head:             { label: 'Pending Director Head',        color: 'orange' },
      re_committee_head:         { label: 'Pending Re-Committee Head',    color: 'teal' },
      supervisor_committee_head: { label: 'Pending Supervisor Cmte Head', color: 'teal' },
      employer_head:             { label: 'Pending Employer Head',        color: 'violet' },
      hr_director:               { label: 'Pending HR Director',          color: 'violet' },
    };
    const info = stageLabels[item.currentStage] || { label: item.currentStage, color: 'slate' };
    const c = info.color;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-${c}-50 text-${c}-800 border border-${c}-200`}>
        <span className={`w-1.5 h-1.5 rounded-full bg-${c}-500 animate-pulse`} /> {info.label}
      </span>
    );
  };

  const getTypeBadge = (type: ApprovalType) => {
    const config: Record<ApprovalType, { icon: string; label: string; color: string }> = {
      member:            { icon: 'fa-user-plus',            label: 'New Member',        color: 'indigo' },
      withdrawal:        { icon: 'fa-money-bill-transfer',  label: 'Withdrawal',        color: 'amber' },
      loan:              { icon: 'fa-hand-holding-dollar',  label: 'Loan',              color: 'emerald' },
      voucher:           { icon: 'fa-receipt',              label: 'Voucher',           color: 'teal' },
      transaction:       { icon: 'fa-receipt',              label: 'Transaction',       color: 'slate' },
      leave:             { icon: 'fa-calendar-xmark',       label: 'Leave Request',     color: 'violet' },
      manual_attendance: { icon: 'fa-fingerprint',          label: 'Manual Attendance', color: 'rose' },
    };
    const t = config[type] || config.transaction;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-${t.color}-50 text-${t.color}-700 border border-${t.color}-100`}>
        <i className={`fa-solid ${t.icon} text-[10px]`} /> {t.label}
      </span>
    );
  };

  // ─── Workflow Progress Dots for table ────────────────────────────────────

  const WorkflowDots = ({ item }: { item: ApprovalItem }) => {
    const stages = getWorkflowStages(item.type);
    return (
      <div className="flex items-center gap-1">
        {stages.map((s, idx) => {
          const approvedStep = item.steps.find(st => st.stage === s.stage && st.action === 'approved');
          const isCurrentPending = item.currentStage === s.stage && item.status === 'pending';
          const isRejectedHere = item.status === 'rejected' && item.rejectedByRole && STAGE_ROLE_MAP[s.stage]?.includes(item.rejectedByRole);
          return (
            <React.Fragment key={s.stage}>
              {idx > 0 && <div className={`w-3 h-0.5 ${approvedStep || item.steps.some(st => st.stage === stages[idx - 1]?.stage && st.action === 'approved') ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  approvedStep
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : isCurrentPending
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                    : isRejectedHere
                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                    : 'bg-slate-100 text-slate-400'
                }`}
                title={s.label}
              >
                {approvedStep ? <i className="fa-solid fa-check text-[9px]" /> : `S${idx + 1}`}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // ─── Workflow Steps in modal ─────────────────────────────────────────────

  const WorkflowSteps = ({ item }: { item: ApprovalItem }) => {
    const stages = getWorkflowStages(item.type);
    return (
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}>
        {stages.map((s) => {
          const approvedStep = item.steps.find(st => st.stage === s.stage && st.action === 'approved');
          const isCurrentPending = item.currentStage === s.stage && item.status === 'pending';
          const isRejected = item.status === 'rejected' && item.rejectedByRole && STAGE_ROLE_MAP[s.stage]?.includes(item.rejectedByRole);
          let cls = 'bg-white border-slate-200 text-slate-400';
          if (approvedStep) cls = 'bg-emerald-50 border-emerald-200 text-emerald-800';
          else if (isCurrentPending) cls = 'bg-amber-50 border-amber-300 text-amber-900 font-bold';
          else if (isRejected) cls = 'bg-rose-50 border-rose-200 text-rose-800';
          return (
            <div key={s.stage} className={`p-2.5 rounded-lg border text-center text-xs ${cls}`}>
              <p className="font-bold text-[11px]">{s.label}</p>
              <p className="text-[10px] mt-0.5">
                {approvedStep ? `✓ ${approvedStep.actionBy}` : isCurrentPending ? 'Pending Review' : isRejected ? '✗ Rejected' : 'Awaiting'}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Tab config ──────────────────────────────────────────────────────────

  const allTabDefs = [
    { key: 'my_queue',          label: 'My Action Queue',    icon: 'fa-inbox',             color: 'amber',  badge: stats.myActionCount },
    { key: 'members',           label: 'Member Approvals',   icon: 'fa-users',             color: 'indigo', badge: stats.pendingMembers },
    { key: 'transactions',      label: 'Withdrawals/Vouchers', icon: 'fa-money-bill-transfer', color: 'blue', badge: stats.pendingTransactions },
    { key: 'loans',             label: 'Loan Approvals',     icon: 'fa-hand-holding-dollar', color: 'emerald', badge: stats.pendingLoans },
    { key: 'leave',             label: 'Leave Approvals',    icon: 'fa-calendar-xmark',    color: 'violet', badge: stats.pendingLeaves },
    { key: 'manual_attendance', label: 'Manual Attendance',  icon: 'fa-fingerprint',       color: 'rose',   badge: stats.pendingAttendance },
    { key: 'all',               label: 'All in Pipeline',    icon: 'fa-bars-progress',     color: 'slate',  badge: stats.totalPending },
    { key: 'history',           label: 'Approval History',   icon: 'fa-clock-rotate-left', color: 'emerald', badge: 0 },
  ].filter(t => allowedTabs.includes(t.key));

  const nextStageLabel = (item: ApprovalItem): string => {
    const stages = getWorkflowStages(item.type);
    const currentIdx = stages.findIndex(s => s.stage === item.currentStage);
    const nextStage = stages[currentIdx + 1];
    if (!nextStage) return 'Final Sanction & Execute';
    return `Approve & Advance to ${nextStage.label}`;
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <PageHeader
        title="Executive Approvals Hub"
        subtitle="Role-based multi-tier authorization workflows for member admissions, financial transactions, loans, vouchers, leave requests, and manual attendance adjustments."
        breadcrumbs={[{ label: 'Approvals' }]}
        action={
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg shadow-sm border border-slate-700 text-xs">
              <i className="fa-solid fa-shield-halved text-amber-400" />
              <span className="text-slate-300">Authorized Role:</span>
              <span className="font-bold text-amber-300">{user?.role}</span>
            </div>
            <button
              onClick={fetchApprovals}
              className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              title="Refresh"
            >
              <i className={`fa-solid fa-arrows-rotate text-xs ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      {/* ── Workflow Architecture Banner ──────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 text-white shadow-md relative overflow-hidden">
        <div className="mb-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60 inline-block mb-1">
            Governance Matrix
          </span>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-diagram-project text-blue-400" />
            Role-Based Multi-Stage Approval Pipelines
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-700/60">
          {/* Member / Withdrawal */}
          <div className="p-3 rounded-xl border bg-slate-800/50 border-slate-700/60">
            <div className="text-[10px] font-bold text-indigo-400 mb-1.5 flex items-center gap-1.5">
              <i className="fa-solid fa-users" /> Member &amp; Withdrawal
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-300">
              <span className="px-1.5 py-0.5 bg-amber-900/40 text-amber-300 rounded">Secretary</span>
              <i className="fa-solid fa-arrow-right text-slate-500" />
              <span className="px-1.5 py-0.5 bg-purple-900/40 text-purple-300 rounded">V.Chairman</span>
              <i className="fa-solid fa-arrow-right text-slate-500" />
              <span className="px-1.5 py-0.5 bg-blue-900/40 text-blue-300 rounded">Chairman</span>
            </div>
          </div>

          {/* Loan */}
          <div className="p-3 rounded-xl border bg-slate-800/50 border-slate-700/60">
            <div className="text-[10px] font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5">
              <i className="fa-solid fa-hand-holding-dollar" /> Loan Application
            </div>
            <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-300">
              <span className="px-1.5 py-0.5 bg-orange-900/40 text-orange-300 rounded">Loan Cmte Head</span>
              <i className="fa-solid fa-arrow-right text-slate-500" />
              <span className="px-1.5 py-0.5 bg-orange-900/40 text-orange-300 rounded">Director Head</span>
              <i className="fa-solid fa-arrow-right text-slate-500" />
              <span className="px-1.5 py-0.5 bg-amber-900/40 text-amber-300 rounded">Secretary</span>
              <i className="fa-solid fa-arrow-right text-slate-500" />
              <span className="px-1.5 py-0.5 bg-blue-900/40 text-blue-300 rounded">Chairman</span>
            </div>
          </div>

          {/* Voucher */}
          <div className="p-3 rounded-xl border bg-slate-800/50 border-slate-700/60">
            <div className="text-[10px] font-bold text-teal-400 mb-1.5 flex items-center gap-1.5">
              <i className="fa-solid fa-receipt" /> Payment Voucher
            </div>
            <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-300">
              <span className="px-1.5 py-0.5 bg-teal-900/40 text-teal-300 rounded">Re-Cmte Head</span>
              <i className="fa-solid fa-arrow-right text-slate-500" />
              <span className="px-1.5 py-0.5 bg-teal-900/40 text-teal-300 rounded">Supvr Cmte Head</span>
              <i className="fa-solid fa-arrow-right text-slate-500" />
              <span className="px-1.5 py-0.5 bg-amber-900/40 text-amber-300 rounded">Secretary</span>
              <i className="fa-solid fa-arrow-right text-slate-500" />
              <span className="px-1.5 py-0.5 bg-blue-900/40 text-blue-300 rounded">Chairman</span>
            </div>
          </div>

          {/* Leave / Attendance */}
          <div className="p-3 rounded-xl border bg-slate-800/50 border-slate-700/60">
            <div className="text-[10px] font-bold text-violet-400 mb-1.5 flex items-center gap-1.5">
              <i className="fa-solid fa-calendar-xmark" /> Leave &amp; Attendance
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-300">
              <span className="px-1.5 py-0.5 bg-violet-900/40 text-violet-300 rounded">Employer Head</span>
              <i className="fa-solid fa-arrow-right text-slate-500" />
              <span className="px-1.5 py-0.5 bg-violet-900/40 text-violet-300 rounded">HR/Director</span>
              <i className="fa-solid fa-arrow-right text-slate-500" />
              <span className="px-1.5 py-0.5 bg-blue-900/40 text-blue-300 rounded">Chairman</span>
            </div>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-slate-400 bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-700/50">
          <i className="fa-solid fa-lock text-amber-400 mr-1.5" />
          <strong className="text-slate-300">Access Restriction:</strong> Each user only sees pending items and history for their own approval chain. Rejection at any stage terminates the workflow immediately.
        </div>
      </div>

      {/* ── KPI Stat Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
        <div onClick={() => setActiveTab('my_queue')} className={`cursor-pointer col-span-2 rounded-xl p-4 border transition-all ${activeTab === 'my_queue' ? 'ring-2 ring-amber-500 shadow-md' : 'hover:border-slate-300'} bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Action Required</span>
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold"><i className="fa-solid fa-bell" /></span>
          </div>
          <p className="text-2xl font-black text-amber-900 mt-2">{stats.myActionCount}</p>
          <p className="text-[11px] text-amber-700 mt-0.5">Pending for your role</p>
        </div>

        {allowedTabs.includes('members') && (
          <div onClick={() => setActiveTab('members')} className={`cursor-pointer rounded-xl p-4 border bg-white transition-all ${activeTab === 'members' ? 'ring-2 ring-indigo-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-indigo-700">Members</span>
              <i className="fa-solid fa-users text-indigo-400 text-sm" />
            </div>
            <p className="text-xl font-black text-slate-800 mt-1">{stats.pendingMembers}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Pending</p>
          </div>
        )}

        {allowedTabs.includes('transactions') && (
          <div onClick={() => setActiveTab('transactions')} className={`cursor-pointer rounded-xl p-4 border bg-white transition-all ${activeTab === 'transactions' ? 'ring-2 ring-blue-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-blue-700">Withdrawals</span>
              <i className="fa-solid fa-money-bill-wave text-blue-400 text-sm" />
            </div>
            <p className="text-xl font-black text-slate-800 mt-1">{stats.pendingTransactions}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Pending</p>
          </div>
        )}

        {allowedTabs.includes('loans') && (
          <div onClick={() => setActiveTab('loans')} className={`cursor-pointer rounded-xl p-4 border bg-white transition-all ${activeTab === 'loans' ? 'ring-2 ring-emerald-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-emerald-700">Loans</span>
              <i className="fa-solid fa-hand-holding-dollar text-emerald-400 text-sm" />
            </div>
            <p className="text-xl font-black text-slate-800 mt-1">{stats.pendingLoans}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Pending</p>
          </div>
        )}

        {allowedTabs.includes('leave') && (
          <div onClick={() => setActiveTab('leave')} className={`cursor-pointer rounded-xl p-4 border bg-white transition-all ${activeTab === 'leave' ? 'ring-2 ring-violet-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-violet-700">Leave</span>
              <i className="fa-solid fa-calendar-xmark text-violet-400 text-sm" />
            </div>
            <p className="text-xl font-black text-slate-800 mt-1">{stats.pendingLeaves}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Pending</p>
          </div>
        )}

        {allowedTabs.includes('manual_attendance') && (
          <div onClick={() => setActiveTab('manual_attendance')} className={`cursor-pointer rounded-xl p-4 border bg-white transition-all ${activeTab === 'manual_attendance' ? 'ring-2 ring-rose-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-rose-700">Attendance</span>
              <i className="fa-solid fa-fingerprint text-rose-400 text-sm" />
            </div>
            <p className="text-xl font-black text-slate-800 mt-1">{stats.pendingAttendance}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Manual Adj.</p>
          </div>
        )}

        <div onClick={() => setActiveTab('history')} className={`cursor-pointer rounded-xl p-4 border bg-white transition-all ${activeTab === 'history' ? 'ring-2 ring-emerald-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-emerald-700">History</span>
            <i className="fa-solid fa-clock-rotate-left text-emerald-400 text-sm" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-xl font-black text-emerald-700">{stats.completedCount}</p>
            <span className="text-[10px] text-rose-500 font-bold">/{stats.rejectedCount} rej.</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Processed</p>
        </div>
      </div>

      {/* ── Main Panel ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Nav Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/50 px-4 pt-3 flex flex-wrap items-center gap-1 overflow-x-auto">
          {allTabDefs.map(tab => {
            const colors: Record<string, string> = {
              amber: 'border-amber-600 text-amber-700',
              indigo: 'border-indigo-600 text-indigo-700',
              blue: 'border-blue-600 text-blue-700',
              emerald: 'border-emerald-600 text-emerald-700',
              violet: 'border-violet-600 text-violet-700',
              rose: 'border-rose-600 text-rose-700',
              slate: 'border-slate-800 text-slate-900',
            };
            const badgeBg: Record<string, string> = {
              amber: 'bg-amber-500', indigo: 'bg-indigo-100 text-indigo-700',
              blue: 'bg-blue-100 text-blue-700', emerald: 'bg-emerald-100 text-emerald-700',
              violet: 'bg-violet-100 text-violet-700', rose: 'bg-rose-100 text-rose-700', slate: 'bg-slate-100 text-slate-700',
            };
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => startTransition(() => setActiveTab(tab.key))}
                className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  isActive ? `${colors[tab.color]} bg-white shadow-sm` : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <i className={`fa-solid ${tab.icon} text-${tab.color}-600`} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`px-1.5 rounded-full text-[10px] font-black ${tab.key === 'my_queue' ? 'bg-amber-500 text-white animate-pulse' : badgeBg[tab.color]}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search by title, reference, name, employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">All Types</option>
              <option value="member">New Members</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="loan">Loans</option>
              <option value="voucher">Vouchers</option>
              <option value="transaction">General Transactions</option>
              <option value="leave">Leave Requests</option>
              <option value="manual_attendance">Manual Attendance</option>
            </select>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">All Stages</option>
              <option value="secretary">Secretary</option>
              <option value="vice_chairman">Vice Chairman</option>
              <option value="chairman">Chairman</option>
              <option value="loan_committee_head">Loan Committee Head</option>
              <option value="director_head">Director Head</option>
              <option value="re_committee_head">Re-Committee Head</option>
              <option value="supervisor_committee_head">Supervisor Committee Head</option>
              <option value="employer_head">Employer Head</option>
              <option value="hr_director">HR Director</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-medium">Loading approvals queue...</p>
            </div>
          ) : approvals.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <i className="fa-solid fa-circle-check text-4xl text-emerald-400 mb-3 block" />
              <p className="font-semibold text-slate-700">No items found in this view</p>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'my_queue'
                  ? 'All items for your role have been reviewed!'
                  : 'No approvals match your current filter settings.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="px-4 py-3">Approval ID</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Subject / Details</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Workflow Progress</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvals.map((item) => {
                  const canAct = canUserActOnItem(item);
                  return (
                    <tr key={item._id} className={`hover:bg-slate-50/80 transition-colors ${canAct ? 'bg-amber-50/30 font-medium' : ''}`}>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{item.approvalNo}</div>
                        {item.referenceNo && <div className="text-[11px] text-slate-500 font-mono mt-0.5">Ref: {item.referenceNo}</div>}
                        <div className="text-[10px] text-slate-400 mt-0.5">{new Date(item.submittedAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getTypeBadge(item.type)}
                        <div className="text-[10px] text-slate-400 mt-1">{item.branch}</div>
                      </td>
                      <td className="px-4 py-3.5 min-w-[200px]">
                        <div className="font-bold text-slate-800 line-clamp-1">{item.title}</div>
                        {item.description && <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</div>}
                        {item.empName && <div className="text-[10px] text-violet-600 mt-0.5 font-semibold">Emp: {item.empName} ({item.empCode})</div>}
                        {item.memberName && <div className="text-[10px] text-indigo-600 mt-0.5 font-semibold">Member: {item.memberName}</div>}
                        <div className="text-[10px] text-slate-400 mt-0.5">Submitted by: <span className="font-semibold text-slate-600">{item.submittedBy}</span></div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {item.amount && item.amount > 0 ? (
                          <span className="font-black text-slate-900">৳ {item.amount.toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <WorkflowDots item={item} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">{getStatusBadge(item)}</td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {canAct ? (
                          <button
                            onClick={() => { setSelectedItem(item); setReviewNotes(''); setReviewModalOpen(true); }}
                            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-lg text-xs shadow-sm transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                            Authorize Now
                          </button>
                        ) : (
                          <button
                            onClick={() => { setSelectedItem(item); setReviewNotes(''); setReviewModalOpen(true); }}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs transition-colors font-medium ml-auto"
                          >
                            Inspect Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Review / Authorization Modal ─────────────────────────────── */}
      {reviewModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded">
                    {selectedItem.approvalNo}
                  </span>
                  {getTypeBadge(selectedItem.type)}
                </div>
                <h3 className="text-base font-bold text-white mt-1.5">{selectedItem.title}</h3>
              </div>
              <button onClick={() => setReviewModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Workflow Steps */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Authorization Journey</h4>
                <WorkflowSteps item={selectedItem} />
              </div>

              {/* Details */}
              <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Request Details</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Reference / No.</span>
                    <span className="font-bold text-slate-800">{selectedItem.referenceNo || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Branch</span>
                    <span className="font-bold text-slate-800">{selectedItem.branch}</span>
                  </div>
                  {selectedItem.memberName && (
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">Member</span>
                      <span className="font-bold text-slate-800">{selectedItem.memberName}</span>
                    </div>
                  )}
                  {selectedItem.empName && (
                    <>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Employee</span>
                        <span className="font-bold text-slate-800">{selectedItem.empName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Emp Code</span>
                        <span className="font-bold text-slate-800">{selectedItem.empCode}</span>
                      </div>
                    </>
                  )}
                  {selectedItem.amount && selectedItem.amount > 0 ? (
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">Amount</span>
                      <span className="font-black text-blue-700 text-sm">৳ {selectedItem.amount.toLocaleString()}</span>
                    </div>
                  ) : null}
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Submitted By</span>
                    <span className="font-semibold text-slate-700">{selectedItem.submittedBy} · {new Date(selectedItem.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Overall State</span>
                    {getStatusBadge(selectedItem)}
                  </div>
                </div>

                {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Additional Metadata</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      {Object.entries(selectedItem.metadata).map(([key, val]) => (
                        <div key={key} className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-slate-400 block text-[9px] uppercase">{key}</span>
                          <span className="font-semibold text-slate-700 truncate block">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Audit History — only shown when all stages complete OR user is in the chain */}
              {selectedItem.steps && selectedItem.steps.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Audit Step Trail</h4>
                  <div className="space-y-2">
                    {selectedItem.steps.map((st, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${st.action === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          <i className={`fa-solid ${st.action === 'approved' ? 'fa-check' : 'fa-xmark'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{st.actionBy} <span className="text-slate-500 font-normal">({st.actionByRole})</span></span>
                            <span className="text-[10px] text-slate-400">{new Date(st.actionAt).toLocaleString()}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 italic">"{st.notes || 'No remarks provided'}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Form or Info */}
              {canUserActOnItem(selectedItem) ? (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <i className="fa-solid fa-stamp text-amber-600 text-sm" />
                    <span>Authorize as {user?.role} — {selectedItem.currentStage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Stage</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Review Remarks (Required if rejecting)</label>
                    <textarea
                      rows={2}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Enter approval notes or rejection reason..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button type="button" disabled={processingAction} onClick={() => handleAction('rejected')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50">
                      <i className="fa-solid fa-xmark" /> Reject &amp; Terminate
                    </button>
                    <button type="button" disabled={processingAction} onClick={() => handleAction('approved')}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                      {processingAction ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <i className="fa-solid fa-check" />}
                      <span>{nextStageLabel(selectedItem)}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100 rounded-xl p-4 text-xs text-slate-600 flex items-center gap-2">
                  <i className="fa-solid fa-circle-info text-blue-500 text-sm" />
                  <div>
                    {selectedItem.status === 'approved' ? (
                      <p>This request was <strong>fully approved</strong> on {new Date(selectedItem.finalApprovedAt || selectedItem.updatedAt || selectedItem.createdAt).toLocaleDateString()} by {selectedItem.finalApprovedBy || 'Chairman'}.</p>
                    ) : selectedItem.status === 'rejected' ? (
                      <p>This request was <strong>rejected</strong> by {selectedItem.rejectedBy} ({selectedItem.rejectedByRole}): "<em>{selectedItem.rejectionReason}</em>".</p>
                    ) : (
                      <p>Currently awaiting <strong>{selectedItem.currentStage.replace(/_/g, ' ').toUpperCase()}</strong> review. Action can only be taken by an authorized executive at that stage.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
              <button onClick={() => setReviewModalOpen(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default function ApprovalsPage() {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ApprovalsContent />
    </React.Suspense>
  );
}
