'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';

interface ApprovalStep {
  stage: 'secretary' | 'vice_chairman' | 'chairman';
  action: 'approved' | 'rejected';
  actionBy: string;
  actionByRole: string;
  notes?: string;
  actionAt: string;
}

interface ApprovalItem {
  _id: string;
  approvalNo: string;
  type: 'member' | 'withdrawal' | 'loan' | 'voucher' | 'transaction';
  title: string;
  description?: string;
  entityId: string;
  entityModel: string;
  referenceNo?: string;
  memberId?: string;
  memberName?: string;
  memberAccountNo?: string;
  amount?: number;
  branch: string;
  status: 'pending' | 'approved' | 'rejected';
  currentStage: 'secretary' | 'vice_chairman' | 'chairman' | 'completed';
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
  totalPending: number;
  completedCount: number;
  rejectedCount: number;
}

function ApprovalsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'my_queue';

  const { user } = useAuth();
  const [, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [stats, setStats] = useState<ApprovalStats>({
    myActionCount: 0,
    pendingMembers: 0,
    pendingTransactions: 0,
    totalPending: 0,
    completedCount: 0,
    rejectedCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  // Selected item for review modal
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // New Transaction Modal
  const [newTxnModalOpen, setNewTxnModalOpen] = useState(false);
  const [txnForm, setTxnForm] = useState({
    title: '',
    type: 'transaction',
    amount: '',
    branch: 'Main Branch',
    description: '',
  });
  const [submittingTxn, setSubmittingTxn] = useState(false);

  // Fetch approvals from API
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

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  // Sync tab with URL if user clicked sidebar sub-item
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams, activeTab]);

  // Check if current user is authorized to act on an item
  const canUserActOnItem = (item: ApprovalItem) => {
    if (!user || item.status !== 'pending') return false;
    if (item.currentStage === 'secretary' && user.role === 'Secretary') return true;
    if (item.currentStage === 'vice_chairman' && user.role === 'Vice Chairman') return true;
    if (item.currentStage === 'chairman' && (user.role === 'Chairman' || user.role === 'Super Admin')) return true;
    return false;
  };

  // Handle Review Action (Approve or Reject)
  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!selectedItem) return;

    if (action === 'rejected' && !reviewNotes.trim()) {
      alert('Please specify a rejection reason for audit records.');
      return;
    }

    const confirmMsg = action === 'approved'
      ? (selectedItem.currentStage === 'chairman'
          ? 'Are you sure you want to grant FINAL APPROVAL? This will activate the member or disburse/execute the transaction.'
          : `Are you sure you want to approve this request and advance it to the next tier?`)
      : 'Are you sure you want to REJECT this request? The workflow will terminate immediately and will NOT pass to the next level.';

    if (!confirm(confirmMsg)) return;

    setProcessingAction(true);
    try {
      const res = await fetch(`/api/approvals/${selectedItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: reviewNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Action failed');
        return;
      }

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

  // Submit ad-hoc transaction
  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnForm.title || !txnForm.amount) {
      alert('Please fill in title and amount');
      return;
    }

    setSubmittingTxn(true);
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txnForm),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to submit transaction');
        return;
      }

      setNewTxnModalOpen(false);
      setTxnForm({
        title: '',
        type: 'transaction',
        amount: '',
        branch: 'Main Branch',
        description: '',
      });
      await fetchApprovals();
    } catch (err) {
      console.error(err);
      alert('Failed to submit transaction');
    } finally {
      setSubmittingTxn(false);
    }
  };

  const getStageBadge = (stage: string, status: string) => {
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <i className="fa-solid fa-circle-xmark text-rose-500" /> Rejected & Terminated
        </span>
      );
    }
    if (status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <i className="fa-solid fa-circle-check text-emerald-500" /> Fully Approved & Active
        </span>
      );
    }
    if (stage === 'secretary') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Stage 1: Pending Secretary
        </span>
      );
    }
    if (stage === 'vice_chairman') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /> Stage 2: Pending Vice Chairman
        </span>
      );
    }
    if (stage === 'chairman') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Stage 3: Pending Chairman
        </span>
      );
    }
    return null;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'member':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <i className="fa-solid fa-user-plus text-[10px]" /> New Member
          </span>
        );
      case 'withdrawal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-100">
            <i className="fa-solid fa-money-bill-transfer text-[10px]" /> Withdrawal
          </span>
        );
      case 'loan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
            <i className="fa-solid fa-hand-holding-dollar text-[10px]" /> Loan Application
          </span>
        );
      case 'voucher':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-100">
            <i className="fa-solid fa-receipt text-[10px]" /> Payment Voucher
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <i className="fa-solid fa-receipt text-[10px]" /> Transaction
          </span>
        );
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Executive Approvals Hub"
        subtitle="Multi-tier authorization workflow (Secretary ➔ Vice Chairman ➔ Chairman) for member admissions and financial transactions."
        breadcrumbs={[{ label: 'Approvals' }]}
        action={
          <div className="flex items-center gap-2.5">
            {/* User role pill indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg shadow-sm border border-slate-700 text-xs">
              <i className="fa-solid fa-shield-halved text-amber-400" />
              <span className="text-slate-300">Authorized Role:</span>
              <span className="font-bold text-amber-300">{user?.role}</span>
            </div>

            <button
              onClick={() => setNewTxnModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-plus" />
              <span>Submit Transaction</span>
            </button>

            <button
              onClick={fetchApprovals}
              className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              title="Refresh Queue"
            >
              <i className={`fa-solid fa-arrows-rotate text-xs ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      {/* ── 3-Tier Workflow Architecture Diagram Banner ───────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60 inline-block mb-1">
                Executive Governance Matrix
              </span>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-diagram-project text-blue-400" />
                Three-Stage Hierarchical Approval Pipeline
              </h2>
            </div>
            <div className="text-xs text-slate-300 max-w-md bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/70">
              <i className="fa-solid fa-circle-info text-blue-400 mr-1.5" />
              <strong>Strict Rule:</strong> Rejection at any level permanently stops the request. Only requests approved by the Secretary reach the Vice Chairman, and only Vice Chairman approvals reach the Chairman.
            </div>
          </div>

          {/* Stepper Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {/* Step 1 */}
            <div className={`p-3.5 rounded-xl border transition-all ${user?.role === 'Secretary' ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/30' : 'bg-slate-800/50 border-slate-700/60'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-black">1</span>
                  Level 1: Secretary Review
                </span>
                {user?.role === 'Secretary' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">Your Level</span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-medium">Initial screening, document validation & policy compliance.</p>
              <p className="text-[11px] text-slate-400 mt-1">If rejected ➔ Request terminates immediately.</p>
            </div>

            {/* Step 2 */}
            <div className={`p-3.5 rounded-xl border transition-all ${user?.role === 'Vice Chairman' ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/30' : 'bg-slate-800/50 border-slate-700/60'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-black">2</span>
                  Level 2: Vice Chairman Authorization
                </span>
                {user?.role === 'Vice Chairman' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500 text-white">Your Level</span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-medium">Operational risk evaluation & secondary administrative check.</p>
              <p className="text-[11px] text-slate-400 mt-1">Only receives items approved by Secretary.</p>
            </div>

            {/* Step 3 */}
            <div className={`p-3.5 rounded-xl border transition-all ${(user?.role === 'Chairman' || user?.role === 'Super Admin') ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-950/30' : 'bg-slate-800/50 border-slate-700/60'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-black">3</span>
                  Level 3: Chairman Sanction
                </span>
                {(user?.role === 'Chairman' || user?.role === 'Super Admin') && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white">Your Level</span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-medium">Final statutory sanction, account activation & disbursement.</p>
              <p className="text-[11px] text-slate-400 mt-1">Only receives items cleared by Vice Chairman.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Stat Summary Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
        {/* Action Required for current user */}
        <div
          onClick={() => { setActiveTab('my_queue'); }}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${activeTab === 'my_queue' ? 'ring-2 ring-amber-500 shadow-md' : 'hover:border-slate-300'} bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Action Required</span>
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
              <i className="fa-solid fa-bell" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-900 mt-2">{stats.myActionCount}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Pending for your role</p>
        </div>

        {/* Pending Members */}
        <div
          onClick={() => { setActiveTab('members'); }}
          className={`cursor-pointer rounded-xl p-4 border bg-white transition-all ${activeTab === 'members' ? 'ring-2 ring-indigo-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">New Members</span>
            <i className="fa-solid fa-users text-indigo-400 text-sm" />
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{stats.pendingMembers}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Member applications</p>
        </div>

        {/* Pending Transactions */}
        <div
          onClick={() => { setActiveTab('transactions'); }}
          className={`cursor-pointer rounded-xl p-4 border bg-white transition-all ${activeTab === 'transactions' ? 'ring-2 ring-blue-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Transactions</span>
            <i className="fa-solid fa-money-bill-wave text-blue-400 text-sm" />
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{stats.pendingTransactions}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Withdrawals, loans, vouchers</p>
        </div>

        {/* Total In Pipeline */}
        <div
          onClick={() => { setActiveTab('all'); }}
          className={`cursor-pointer rounded-xl p-4 border bg-white transition-all ${activeTab === 'all' ? 'ring-2 ring-slate-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">In Pipeline</span>
            <i className="fa-solid fa-bars-progress text-slate-400 text-sm" />
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{stats.totalPending}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Total across all levels</p>
        </div>

        {/* History: Completed / Rejected */}
        <div
          onClick={() => { setActiveTab('history'); }}
          className={`cursor-pointer rounded-xl p-4 border bg-white transition-all ${activeTab === 'history' ? 'ring-2 ring-emerald-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">History Log</span>
            <i className="fa-solid fa-clock-rotate-left text-emerald-400 text-sm" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-black text-emerald-700">{stats.completedCount}</p>
            <span className="text-xs text-slate-400 font-semibold">/</span>
            <p className="text-sm font-bold text-rose-600">{stats.rejectedCount} rejected</p>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Processed decisions</p>
        </div>
      </div>

      {/* ── Main Panel ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/50 px-4 pt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-px">
            <button
              onClick={() => { startTransition(() => setActiveTab('my_queue')); }}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'my_queue'
                  ? 'border-amber-600 text-amber-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <i className="fa-solid fa-inbox text-amber-600" />
              <span>My Action Queue</span>
              {stats.myActionCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                  {stats.myActionCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { startTransition(() => setActiveTab('members')); }}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'members'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <i className="fa-solid fa-users text-indigo-600" />
              <span>Member Approvals</span>
              {stats.pendingMembers > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700">
                  {stats.pendingMembers}
                </span>
              )}
            </button>

            <button
              onClick={() => { startTransition(() => setActiveTab('transactions')); }}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'transactions'
                  ? 'border-blue-600 text-blue-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <i className="fa-solid fa-money-bill-transfer text-blue-600" />
              <span>Transaction Approvals</span>
              {stats.pendingTransactions > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-100 text-blue-700">
                  {stats.pendingTransactions}
                </span>
              )}
            </button>

            <button
              onClick={() => { startTransition(() => setActiveTab('all')); }}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'border-slate-800 text-slate-900 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <i className="fa-solid fa-bars-progress text-slate-600" />
              <span>All in Pipeline</span>
            </button>

            <button
              onClick={() => { startTransition(() => setActiveTab('history')); }}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <i className="fa-solid fa-clock-rotate-left text-emerald-600" />
              <span>Approval History</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search by title, reference no, member name, account..."
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
            </select>

            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">All Stages</option>
              <option value="secretary">Stage 1: Secretary</option>
              <option value="vice_chairman">Stage 2: Vice Chairman</option>
              <option value="chairman">Stage 3: Chairman</option>
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
                  ? 'All items for your role have been reviewed! Check "All in Pipeline" to track items at other levels.'
                  : 'No approvals match your current filter settings.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="px-4 py-3">Approval ID & Ref</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Subject / Details</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">3-Stage Progress</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvals.map((item) => {
                  const canAct = canUserActOnItem(item);
                  const isSecretaryApproved = item.steps.some(s => s.stage === 'secretary' && s.action === 'approved');
                  const isViceApproved = item.steps.some(s => s.stage === 'vice_chairman' && s.action === 'approved');
                  const isChairmanApproved = item.steps.some(s => s.stage === 'chairman' && s.action === 'approved');

                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-slate-50/80 transition-colors ${canAct ? 'bg-amber-50/30 font-medium' : ''}`}
                    >
                      {/* ID & Reference */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{item.approvalNo}</div>
                        {item.referenceNo && (
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">Ref: {item.referenceNo}</div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getTypeBadge(item.type)}
                        <div className="text-[10px] text-slate-400 mt-1">{item.branch}</div>
                      </td>

                      {/* Title & Beneficiary */}
                      <td className="px-4 py-3.5 min-w-[200px]">
                        <div className="font-bold text-slate-800 line-clamp-1">{item.title}</div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Submitted by: <span className="font-semibold text-slate-600">{item.submittedBy}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {item.amount && item.amount > 0 ? (
                          <span className="font-black text-slate-900">
                            ৳ {item.amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* 3-Stage Progress Indicator */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {/* S1: Secretary */}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isSecretaryApproved
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                : item.currentStage === 'secretary' && item.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                                : item.status === 'rejected' && item.rejectedByRole === 'Secretary'
                                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                            title="Stage 1: Secretary"
                          >
                            {isSecretaryApproved ? <i className="fa-solid fa-check text-[9px]" /> : 'S1'}
                          </div>

                          <div className={`w-3 h-0.5 ${isSecretaryApproved ? 'bg-emerald-400' : 'bg-slate-200'}`} />

                          {/* S2: Vice Chairman */}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isViceApproved
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                : item.currentStage === 'vice_chairman' && item.status === 'pending'
                                ? 'bg-purple-100 text-purple-800 border border-purple-300 animate-pulse'
                                : item.status === 'rejected' && item.rejectedByRole === 'Vice Chairman'
                                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                            title="Stage 2: Vice Chairman"
                          >
                            {isViceApproved ? <i className="fa-solid fa-check text-[9px]" /> : 'S2'}
                          </div>

                          <div className={`w-3 h-0.5 ${isViceApproved ? 'bg-emerald-400' : 'bg-slate-200'}`} />

                          {/* S3: Chairman */}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isChairmanApproved
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                : item.currentStage === 'chairman' && item.status === 'pending'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                                : item.status === 'rejected' && item.rejectedByRole === 'Chairman'
                                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                            title="Stage 3: Chairman"
                          >
                            {isChairmanApproved ? <i className="fa-solid fa-check text-[9px]" /> : 'S3'}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getStageBadge(item.currentStage, item.status)}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {canAct ? (
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setReviewNotes('');
                              setReviewModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-lg text-xs shadow-sm transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                            <span>Authorize Now</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setReviewNotes('');
                              setReviewModalOpen(true);
                            }}
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

      {/* ── Detailed Review & Authorization Modal ─────────────────────────────── */}
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
              <button
                onClick={() => setReviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Stepper Pipeline Status */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Authorization Journey</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {/* Step 1 */}
                  <div className={`p-2.5 rounded-lg border ${
                    selectedItem.steps.some(s => s.stage === 'secretary' && s.action === 'approved')
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : selectedItem.currentStage === 'secretary' && selectedItem.status === 'pending'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                      : selectedItem.status === 'rejected' && selectedItem.rejectedByRole === 'Secretary'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <p className="font-bold text-[11px]">1. Secretary</p>
                    <p className="text-[10px] mt-0.5">
                      {selectedItem.steps.find(s => s.stage === 'secretary')?.actionBy
                        ? `Approved by ${selectedItem.steps.find(s => s.stage === 'secretary')?.actionBy}`
                        : selectedItem.currentStage === 'secretary'
                        ? 'Pending Review'
                        : 'Awaiting'}
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-2.5 rounded-lg border ${
                    selectedItem.steps.some(s => s.stage === 'vice_chairman' && s.action === 'approved')
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : selectedItem.currentStage === 'vice_chairman' && selectedItem.status === 'pending'
                      ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold'
                      : selectedItem.status === 'rejected' && selectedItem.rejectedByRole === 'Vice Chairman'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <p className="font-bold text-[11px]">2. Vice Chairman</p>
                    <p className="text-[10px] mt-0.5">
                      {selectedItem.steps.find(s => s.stage === 'vice_chairman')?.actionBy
                        ? `Approved by ${selectedItem.steps.find(s => s.stage === 'vice_chairman')?.actionBy}`
                        : selectedItem.currentStage === 'vice_chairman'
                        ? 'Pending Review'
                        : 'Awaiting'}
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-2.5 rounded-lg border ${
                    selectedItem.steps.some(s => s.stage === 'chairman' && s.action === 'approved')
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : selectedItem.currentStage === 'chairman' && selectedItem.status === 'pending'
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                      : selectedItem.status === 'rejected' && selectedItem.rejectedByRole === 'Chairman'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <p className="font-bold text-[11px]">3. Chairman</p>
                    <p className="text-[10px] mt-0.5">
                      {selectedItem.steps.find(s => s.stage === 'chairman')?.actionBy
                        ? `Sanctioned by ${selectedItem.steps.find(s => s.stage === 'chairman')?.actionBy}`
                        : selectedItem.currentStage === 'chairman'
                        ? 'Pending Sanction'
                        : 'Awaiting'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Breakdown */}
              <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Request Details</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Reference / Account No</span>
                    <span className="font-bold text-slate-800">{selectedItem.referenceNo || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Branch</span>
                    <span className="font-bold text-slate-800">{selectedItem.branch}</span>
                  </div>
                  {selectedItem.memberName && (
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">Member Name</span>
                      <span className="font-bold text-slate-800">{selectedItem.memberName}</span>
                    </div>
                  )}
                  {selectedItem.amount && selectedItem.amount > 0 ? (
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">Financial Amount</span>
                      <span className="font-black text-blue-700 text-sm">৳ {selectedItem.amount.toLocaleString()}</span>
                    </div>
                  ) : null}
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Submitted By</span>
                    <span className="font-semibold text-slate-700">{selectedItem.submittedBy} on {new Date(selectedItem.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Overall State</span>
                    {getStageBadge(selectedItem.currentStage, selectedItem.status)}
                  </div>
                </div>

                {/* Metadata details */}
                {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Additional Application Metadata</p>
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

              {/* Step Audit History */}
              {selectedItem.steps && selectedItem.steps.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Audit Step Trail</h4>
                  <div className="space-y-2">
                    {selectedItem.steps.map((st, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          st.action === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          <i className={`fa-solid ${st.action === 'approved' ? 'fa-check' : 'fa-xmark'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{st.actionBy} ({st.actionByRole})</span>
                            <span className="text-[10px] text-slate-400">{new Date(st.actionAt).toLocaleString()}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 italic">"{st.notes || 'No remarks provided'}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Form or Notice */}
              {canUserActOnItem(selectedItem) ? (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <i className="fa-solid fa-stamp text-amber-600 text-sm" />
                    <span>Authorize as {user?.role} ({
                      selectedItem.currentStage === 'secretary'
                        ? 'Stage 1: Secretary Clearance'
                        : selectedItem.currentStage === 'vice_chairman'
                        ? 'Stage 2: Vice Chairman Authorization'
                        : 'Stage 3: Chairman Final Sanction'
                    })</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Review Remarks / Notes (Required if rejecting)
                    </label>
                    <textarea
                      rows={2}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Enter approval endorsement notes or rejection reason..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      disabled={processingAction}
                      onClick={() => handleAction('rejected')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <i className="fa-solid fa-xmark" />
                      <span>Reject & Terminate</span>
                    </button>

                    <button
                      type="button"
                      disabled={processingAction}
                      onClick={() => handleAction('approved')}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                      {processingAction ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <i className="fa-solid fa-check" />
                      )}
                      <span>
                        {selectedItem.currentStage === 'chairman'
                          ? 'Final Sanction & Execute'
                          : selectedItem.currentStage === 'secretary'
                          ? 'Approve & Advance to Vice Chairman'
                          : 'Approve & Advance to Chairman'}
                      </span>
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
                      <p>This request was <strong>rejected</strong> by {selectedItem.rejectedBy} ({selectedItem.rejectedByRole}): "{selectedItem.rejectionReason}".</p>
                    ) : (
                      <p>
                        Currently awaiting <strong>{selectedItem.currentStage.replace('_', ' ').toUpperCase()}</strong> review.
                        Action can only be performed by that executive authority.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit Transaction for Approval Modal ─────────────────────────────── */}
      {newTxnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-paper-plane text-blue-400" />
                  Submit Transaction for Executive Approval
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Enters Stage 1 (Secretary review) in the executive pipeline.
                </p>
              </div>
              <button
                onClick={() => setNewTxnModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>

            <form onSubmit={handleSubmitTransaction} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Transaction Title / Head</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office Rent Advance Payment or Special Reserve Withdrawal"
                  value={txnForm.title}
                  onChange={(e) => setTxnForm({ ...txnForm, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Transaction Type</label>
                  <select
                    value={txnForm.type}
                    onChange={(e) => setTxnForm({ ...txnForm, type: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="transaction">General Transaction</option>
                    <option value="voucher">Payment Voucher</option>
                    <option value="withdrawal">Special Withdrawal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount (৳)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="50000"
                    value={txnForm.amount}
                    onChange={(e) => setTxnForm({ ...txnForm, amount: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Branch</label>
                <input
                  type="text"
                  value={txnForm.branch}
                  onChange={(e) => setTxnForm({ ...txnForm, branch: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Purpose / Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide background justification and documentation reference..."
                  value={txnForm.description}
                  onChange={(e) => setTxnForm({ ...txnForm, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewTxnModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTxn}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingTxn ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <i className="fa-solid fa-check" />
                  )}
                  <span>Submit for Level 1 Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default function ApprovalsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ApprovalsContent />
    </React.Suspense>
  );
}
