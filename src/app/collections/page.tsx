'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';

interface CollectionRecord {
  _id: string;
  date: string;
  memberName: string;
  accountNo: string;
  branch: string;
  type: 'savings' | 'loan_installment' | 'advance' | 'withdrawal';
  amount: number;
  collectedBy: string;
  notes?: string;
}

interface DepositAccountItem {
  _id: string;
  accountNo: string;
  memberName: string;
  type: string;
  balance: number;
}

const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300';

export default function CentralizedCollectionsPage() {
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [totals, setTotals] = useState({ totalDeposits: 0, totalWithdrawals: 0 });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Modals for Deposit and Withdrawal collection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'savings' | 'withdrawal'>('savings');
  const [depositAccounts, setDepositAccounts] = useState<DepositAccountItem[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [collectionAmount, setCollectionAmount] = useState<number | ''>('');
  const [collectorName, setCollectorName] = useState('Counter Cashier');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (search.trim()) params.append('search', search);

      const res = await fetch(`/api/collections?${params}`);
      const data = await res.json();
      setCollections(data.collections || []);
      if (data.totals) setTotals(data.totals);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [filterType, search]);

  const fetchDepositAccounts = async () => {
    try {
      const res = await fetch('/api/savings/deposits?limit=150&status=active');
      const data = await res.json();
      const accs = data.deposits || [];
      setDepositAccounts(accs);
      if (accs.length > 0) setSelectedAccountId(accs[0]._id);
    } catch {
      // Ignore
    }
  };

  const handleOpenModal = (type: 'savings' | 'withdrawal') => {
    setModalType(type);
    setCollectionAmount('');
    setNotes('');
    fetchDepositAccounts();
    setIsModalOpen(true);
  };

  const selectedAccount = depositAccounts.find(a => a._id === selectedAccountId);

  const handleSubmitCollection = async () => {
    if (!selectedAccountId || !collectionAmount || Number(collectionAmount) <= 0) {
      alert('Please select an account and enter a valid positive amount');
      return;
    }

    if (modalType === 'withdrawal' && selectedAccount && Number(collectionAmount) > selectedAccount.balance) {
      alert(`Insufficient funds! Available balance: ৳ ${selectedAccount.balance.toLocaleString()}`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: modalType,
          accountId: selectedAccountId,
          amount: Number(collectionAmount),
          collectedBy: collectorName,
          notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to record collection');
        return;
      }

      setIsModalOpen(false);
      fetchCollections();
      alert(`${modalType === 'savings' ? 'Deposit' : 'Withdrawal'} recorded successfully!`);
    } catch {
      alert('Network error while recording collection');
    } finally {
      setSaving(false);
    }
  };

  const handlePrintSlip = (c: CollectionRecord) => {
    const printWindow = window.open('', '_blank', 'width=600,height=450');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Collection Receipt - ${c._id}</title>
          <style>
            body { font-family: sans-serif; padding: 25px; font-size: 13px; color: #1e293b; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 15px; }
            h2 { margin: 0; color: #1e3a8a; font-size: 18px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            td { padding: 8px 4px; border-bottom: 1px solid #e2e8f0; }
            .font-bold { font-weight: bold; }
            .sig-row { display: flex; justify-content: space-between; margin-top: 40px; font-size: 11px; }
            .sig-line { border-top: 1px solid #475569; width: 130px; text-align: center; padding-top: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>SOMITY ONLINE COOPERATIVE SOCIETY</h2>
            <p>Official Transaction Cash Receipt / Voucher</p>
          </div>
          <table>
            <tr><td class="font-bold">Transaction Type:</td><td class="font-bold uppercase">${c.type === 'savings' ? 'Savings Deposit' : c.type === 'withdrawal' ? 'Savings Withdrawal' : 'Loan Installment'}</td></tr>
            <tr><td class="font-bold">Member Name:</td><td>${c.memberName}</td></tr>
            <tr><td class="font-bold">Account / Reference:</td><td>${c.accountNo}</td></tr>
            <tr><td class="font-bold">Branch:</td><td>${c.branch}</td></tr>
            <tr><td class="font-bold">Transaction Amount:</td><td class="font-bold" style="font-size: 16px; color: ${c.type === 'withdrawal' ? '#e11d48' : '#16a34a'};">৳ ${c.amount.toLocaleString()}</td></tr>
            <tr><td class="font-bold">Received / Disbursed By:</td><td>${c.collectedBy}</td></tr>
            <tr><td class="font-bold">Date & Time:</td><td>${new Date(c.date).toLocaleString()}</td></tr>
          </table>
          <div class="sig-row">
            <div class="sig-line">Officer In-Charge</div>
            <div class="sig-line">Member Signature</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const netCashFlow = totals.totalDeposits - totals.totalWithdrawals;

  return (
    <AppLayout>
      <PageHeader
        title="Centralized Collections & Cash Desk"
        subtitle="Universal counter and field cash entry: Record instantaneous Deposit Collections and counter Withdrawal Disbursements."
        breadcrumbs={[{ label: 'Collections' }]}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenModal('savings')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-circle-plus"></i>
              Record Deposit Collection
            </button>
            <button
              onClick={() => handleOpenModal('withdrawal')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-circle-minus"></i>
              Record Withdrawal Collection
            </button>
            <Link
              href="/collections/daily"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-sheet-plastic"></i>
              Daily Sheet
            </Link>
          </div>
        }
      />

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase text-emerald-700 block">Total Inflow (Deposits)</span>
            <span className="text-2xl font-black text-emerald-900">৳ {totals.totalDeposits.toLocaleString()}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <i className="fa-solid fa-arrow-down-long"></i>
          </div>
        </div>

        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase text-rose-700 block">Total Outflow (Withdrawals)</span>
            <span className="text-2xl font-black text-rose-900">৳ {totals.totalWithdrawals.toLocaleString()}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <i className="fa-solid fa-arrow-up-long"></i>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase text-blue-700 block">Net Counter Cash Flow</span>
            <span className={`text-2xl font-black ${netCashFlow >= 0 ? 'text-blue-900' : 'text-rose-700'}`}>
              ৳ {netCashFlow.toLocaleString()}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <i className="fa-solid fa-vault"></i>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'All Collections', value: 'all' },
              { label: 'Deposit Collections', value: 'savings' },
              { label: 'Withdrawal Collections', value: 'withdrawal' },
              { label: 'Loan Installments', value: 'loan_installment' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilterType(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterType === tab.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search member, account, ref..."
              className={inputClass}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Collections Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <i className="fa-solid fa-receipt text-3xl mb-2 text-slate-300 block"></i>
            No collections found matching your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Member Name</th>
                  <th className="py-3 px-3">Account No</th>
                  <th className="py-3 px-3">Branch</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3">Collected / Paid By</th>
                  <th className="py-3 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {collections.map(c => {
                  const isWithdrawal = c.type === 'withdrawal';
                  const isDeposit = c.type === 'savings';

                  return (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-slate-500 font-medium">
                        {new Date(c.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isDeposit ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isWithdrawal ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {isDeposit ? 'Deposit' : isWithdrawal ? 'Withdrawal' : 'Installment'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{c.memberName}</td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-600">{c.accountNo}</td>
                      <td className="py-3 px-3 text-slate-500">{c.branch}</td>
                      <td className={`py-3 px-3 text-right font-black text-sm font-mono ${isWithdrawal ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isWithdrawal ? `- ৳ ${c.amount.toLocaleString()}` : `+ ৳ ${c.amount.toLocaleString()}`}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <span>{c.collectedBy}</span>
                        {c.notes && <span className="text-[10px] text-slate-400 block truncate max-w-xs">({c.notes})</span>}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handlePrintSlip(c)}
                          className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-blue-600 font-bold text-xs rounded transition-colors"
                          title="Print Receipt Slip"
                        >
                          <i className="fa-solid fa-print"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Collection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'savings' ? 'Record Deposit Collection' : 'Record Counter Withdrawal Collection'}
        footer={
          <div className="flex justify-between w-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg text-xs hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitCollection}
              disabled={saving}
              className={`px-5 py-2 text-white font-bold rounded-lg text-xs shadow-sm transition-colors disabled:opacity-50 ${modalType === 'savings' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
            >
              {saving ? 'Processing...' : modalType === 'savings' ? 'Confirm Deposit Receipt' : 'Confirm Cash Withdrawal'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Member & Savings Account *</label>
            <select
              className={inputClass}
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
            >
              {depositAccounts.map(a => (
                <option key={a._id} value={a._id}>
                  {a.accountNo} — {a.memberName} | {a.type} (Live Balance: ৳ {a.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {selectedAccount && (
            <div className={`p-3 rounded-lg border flex justify-between items-center ${modalType === 'savings' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
              <div>
                <span className="font-bold block">{selectedAccount.memberName}</span>
                <span className="font-mono text-[10px]">{selectedAccount.accountNo} ({selectedAccount.type})</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] block font-semibold">Available Balance</span>
                <span className="text-sm font-black font-mono">৳ {selectedAccount.balance.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {modalType === 'savings' ? 'Deposit Amount (৳) *' : 'Withdrawal Amount (৳) *'}
            </label>
            <input
              type="number"
              min={1}
              max={modalType === 'withdrawal' && selectedAccount ? selectedAccount.balance : undefined}
              placeholder="Enter amount"
              className={inputClass}
              value={collectionAmount}
              onChange={e => setCollectionAmount(e.target.value === '' ? '' : Number(e.target.value))}
            />
            {modalType === 'withdrawal' && selectedAccount && Number(collectionAmount) > selectedAccount.balance && (
              <p className="text-[10px] text-rose-600 font-bold mt-1">
                Amount exceeds available balance of ৳ {selectedAccount.balance.toLocaleString()}!
              </p>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Cashier / Field Officer</label>
            <input
              type="text"
              className={inputClass}
              value={collectorName}
              onChange={e => setCollectorName(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes / Remarks</label>
            <textarea
              rows={2}
              placeholder="Optional reference or installment note"
              className={inputClass}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
