'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface AccountItem {
  _id: string;
  accountNo: string;
  type: string;
  balance: number;
  status: string;
}

interface MemberSearchResult {
  _id: string;
  accountNo: string;
  name: string;
  mobile: string;
  branch: string;
  totalDeposit: number;
  accounts: AccountItem[];
}

interface TransferRecord {
  _id: string;
  transferType: 'Amount Transfer' | 'Account Ownership Transfer';
  sourceMemberName: string;
  sourceAccountNo: string;
  targetMemberName: string;
  targetAccountNo?: string;
  amount: number;
  reason: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Rejected';
}

const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300';

export default function MemberTransfersPage() {
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transferType, setTransferType] = useState<'Amount Transfer' | 'Account Ownership Transfer'>('Amount Transfer');

  // Search state for Source
  const [sourceQuery, setSourceQuery] = useState('');
  const [sourceResults, setSourceResults] = useState<MemberSearchResult[]>([]);
  const [selectedSourceMember, setSelectedSourceMember] = useState<MemberSearchResult | null>(null);
  const [selectedSourceAccount, setSelectedSourceAccount] = useState<AccountItem | null>(null);

  // Search state for Destination
  const [targetQuery, setTargetQuery] = useState('');
  const [targetResults, setTargetResults] = useState<MemberSearchResult[]>([]);
  const [selectedTargetMember, setSelectedTargetMember] = useState<MemberSearchResult | null>(null);
  const [selectedTargetAccount, setSelectedTargetAccount] = useState<AccountItem | null>(null);

  const [transferAmount, setTransferAmount] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/members/transfers');
      const data = await res.json();
      setTransfers(data.transfers || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  // Search source
  useEffect(() => {
    if (!sourceQuery.trim()) {
      setSourceResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/members/search?q=${encodeURIComponent(sourceQuery)}`);
        const data = await res.json();
        setSourceResults(data.members || []);
      } catch {
        // Ignore
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [sourceQuery]);

  // Search target
  useEffect(() => {
    if (!targetQuery.trim()) {
      setTargetResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/members/search?q=${encodeURIComponent(targetQuery)}`);
        const data = await res.json();
        setTargetResults(data.members || []);
      } catch {
        // Ignore
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [targetQuery]);

  const handleOpenModal = (type: 'Amount Transfer' | 'Account Ownership Transfer') => {
    setTransferType(type);
    setSelectedSourceMember(null);
    setSelectedSourceAccount(null);
    setSelectedTargetMember(null);
    setSelectedTargetAccount(null);
    setSourceQuery('');
    setTargetQuery('');
    setTransferAmount('');
    setReason('');
    setIsModalOpen(true);
  };

  const handleSubmitTransfer = async () => {
    if (!selectedSourceAccount) {
      alert('Please select a source account');
      return;
    }
    if (!reason.trim()) {
      alert('Please enter a transfer reason');
      return;
    }

    if (transferType === 'Amount Transfer') {
      if (!transferAmount || Number(transferAmount) <= 0) {
        alert('Please enter a valid transfer amount');
        return;
      }
      if (Number(transferAmount) > selectedSourceAccount.balance) {
        alert(`Insufficient balance! Available: ৳ ${selectedSourceAccount.balance.toLocaleString()}`);
        return;
      }
      if (!selectedTargetAccount) {
        alert('Please select a destination account');
        return;
      }
      if (selectedSourceAccount.accountNo === selectedTargetAccount.accountNo) {
        alert('Cannot transfer funds to the exact same account!');
        return;
      }
    }

    if (transferType === 'Account Ownership Transfer') {
      if (!selectedTargetMember) {
        alert('Please select a target member to transfer ownership to');
        return;
      }
      if (selectedSourceMember?._id === selectedTargetMember._id) {
        alert('Target member must be different from source member');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        transferType,
        sourceAccountNo: selectedSourceAccount.accountNo,
        targetMemberId: selectedTargetMember?._id,
        targetAccountNo: selectedTargetAccount?.accountNo,
        amount: transferType === 'Amount Transfer' ? Number(transferAmount) : selectedSourceAccount.balance,
        reason,
      };

      const res = await fetch('/api/members/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Transfer failed');
        return;
      }

      setIsModalOpen(false);
      fetchTransfers();
      alert('Transfer processed successfully!');
    } catch {
      alert('Network error while processing transfer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Member Transfers Management"
        subtitle="Process instant intra-society amount transfers and book ownership re-assignments with real-time balance checks."
        breadcrumbs={[{ label: 'Members', href: '/members' }, { label: 'Transfers' }]}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenModal('Amount Transfer')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-money-bill-transfer"></i>
              New Amount Transfer
            </button>
            <button
              onClick={() => handleOpenModal('Account Ownership Transfer')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-user-gear"></i>
              Transfer Ownership
            </button>
          </div>
        }
      />

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-blue-600"></i>
            Transfer Audit Log & Ledger History
          </h3>
          <span className="text-xs text-slate-400">Total {transfers.length} recorded transfers</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <i className="fa-solid fa-arrow-right-arrow-left text-3xl mb-2 text-slate-300 block"></i>
            No member account or fund transfers recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Transfer Type</th>
                  <th className="py-3 px-3">Source Member & Account</th>
                  <th className="py-3 px-3">Destination Member & Account</th>
                  <th className="py-3 px-3 text-right">Transfer Amount</th>
                  <th className="py-3 px-3">Reason / Reference</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.map(t => (
                  <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-slate-500 font-medium">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${t.transferType === 'Amount Transfer' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                        {t.transferType}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{t.sourceMemberName}</span>
                      <span className="font-mono text-[10px] text-blue-600 font-semibold">{t.sourceAccountNo}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{t.targetMemberName}</span>
                      {t.targetAccountNo && (
                        <span className="font-mono text-[10px] text-emerald-600 font-semibold">{t.targetAccountNo}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                      ৳ {t.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={t.reason}>
                      {t.reason}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant={t.status === 'Completed' ? 'success' : 'warning'}>
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transfer Execution Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={transferType === 'Amount Transfer' ? 'Execute Member Fund / Amount Transfer' : 'Execute Account / Book Ownership Transfer'}
        footer={
          <div className="flex justify-between w-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg text-xs hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitTransfer}
              disabled={submitting}
              className={`px-5 py-2 text-white font-bold rounded-lg text-xs shadow-sm transition-colors disabled:opacity-50 ${transferType === 'Amount Transfer' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {submitting ? 'Processing Transfer...' : `Confirm ${transferType}`}
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-2">
          {/* Source Search Section */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-slate-800 text-[11px] uppercase flex items-center justify-between">
              <span>1. Source Account & Member Selection</span>
              {selectedSourceAccount && (
                <span className="text-emerald-700 font-bold font-mono">
                  Live Balance: ৳ {selectedSourceAccount.balance.toLocaleString()}
                </span>
              )}
            </div>

            {!selectedSourceMember ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Source Member by Name, Account No, Mobile..."
                  className={inputClass}
                  value={sourceQuery}
                  onChange={e => setSourceQuery(e.target.value)}
                />
                {sourceResults.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {sourceResults.map(m => (
                      <div
                        key={m._id}
                        onClick={() => {
                          setSelectedSourceMember(m);
                          if (m.accounts.length > 0) setSelectedSourceAccount(m.accounts[0]);
                          setSourceResults([]);
                          setSourceQuery('');
                        }}
                        className="p-2.5 hover:bg-blue-50 cursor-pointer flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{m.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{m.accountNo} | {m.mobile}</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600">
                          {m.accounts.length} active books (৳ {m.totalDeposit.toLocaleString()})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{selectedSourceMember.name}</span>
                    <span className="font-mono text-[10px] text-blue-600 font-semibold">{selectedSourceMember.accountNo} ({selectedSourceMember.branch})</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSourceMember(null);
                      setSelectedSourceAccount(null);
                    }}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Source Account Book *</label>
                  <select
                    className={inputClass}
                    value={selectedSourceAccount?.accountNo || ''}
                    onChange={e => {
                      const acc = selectedSourceMember.accounts.find(a => a.accountNo === e.target.value);
                      if (acc) setSelectedSourceAccount(acc);
                    }}
                  >
                    {selectedSourceMember.accounts.map(acc => (
                      <option key={acc.accountNo} value={acc.accountNo}>
                        {acc.accountNo} — {acc.type} (Live Balance: ৳ {acc.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Destination Section */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-slate-800 text-[11px] uppercase">
              2. Destination {transferType === 'Amount Transfer' ? 'Account & Member' : 'Target Member'}
            </div>

            {!selectedTargetMember ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Destination Member by Name, Account No, Mobile..."
                  className={inputClass}
                  value={targetQuery}
                  onChange={e => setTargetQuery(e.target.value)}
                />
                {targetResults.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {targetResults.map(m => (
                      <div
                        key={m._id}
                        onClick={() => {
                          setSelectedTargetMember(m);
                          if (m.accounts.length > 0) setSelectedTargetAccount(m.accounts[0]);
                          setTargetResults([]);
                          setTargetQuery('');
                        }}
                        className="p-2.5 hover:bg-blue-50 cursor-pointer flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{m.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{m.accountNo} | {m.mobile}</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600">
                          {m.accounts.length} active books
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{selectedTargetMember.name}</span>
                    <span className="font-mono text-[10px] text-emerald-600 font-semibold">{selectedTargetMember.accountNo} ({selectedTargetMember.branch})</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTargetMember(null);
                      setSelectedTargetAccount(null);
                    }}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Change
                  </button>
                </div>

                {transferType === 'Amount Transfer' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Destination Account Book *</label>
                    <select
                      className={inputClass}
                      value={selectedTargetAccount?.accountNo || ''}
                      onChange={e => {
                        const acc = selectedTargetMember.accounts.find(a => a.accountNo === e.target.value);
                        if (acc) setSelectedTargetAccount(acc);
                      }}
                    >
                      {selectedTargetMember.accounts.map(acc => (
                        <option key={acc.accountNo} value={acc.accountNo}>
                          {acc.accountNo} — {acc.type} (Live Balance: ৳ {acc.balance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amount & Reason */}
          <div className="space-y-3">
            {transferType === 'Amount Transfer' ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Transfer Amount (৳) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedSourceAccount?.balance || undefined}
                  placeholder={`Max allowed: ৳ ${selectedSourceAccount?.balance.toLocaleString() || 0}`}
                  className={inputClass}
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value === '' ? '' : Number(e.target.value))}
                />
                {selectedSourceAccount && Number(transferAmount) > selectedSourceAccount.balance && (
                  <p className="text-[10px] text-rose-600 font-bold mt-1">
                    Warning: Transfer amount exceeds available account balance of ৳ {selectedSourceAccount.balance.toLocaleString()}!
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900">
                <strong>Account Transfer Notice:</strong> The entire book <strong>{selectedSourceAccount?.accountNo}</strong> ({selectedSourceAccount?.type}) with total balance <strong>৳ {selectedSourceAccount?.balance.toLocaleString()}</strong> will be transferred to <strong>{selectedTargetMember?.name || 'Selected Target'}</strong>.
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Transfer Reason / Remarks *</label>
              <textarea
                rows={2}
                placeholder="e.g. Account balance settlement, family fund transfer, relocation"
                className={inputClass}
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
