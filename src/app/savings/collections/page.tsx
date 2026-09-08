'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';

interface MemberAccount {
  _id: string;
  accountNo: string;
  type: string;
  balance: number;
  status: string;
}

interface Member {
  _id: string;
  name: string;
  accountNo: string;
  mobile: string;
  totalDeposit: number;
}

export default function SavingsCollectionPage() {
  const [searchText, setSearchText] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [accounts, setAccounts] = useState<MemberAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [collectedBy, setCollectedBy] = useState('');
  const [employees, setEmployees] = useState<Array<{ _id: string; name: string; designation: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetch('/api/hr/employees?status=active&limit=50')
      .then(r => r.json())
      .then(d => {
        setEmployees(d.employees ?? []);
        if (d.employees?.length) setCollectedBy(d.employees[0]._id);
      });
  }, []);

  const searchMembers = useCallback(async (q: string) => {
    if (!q.trim()) { setMembers([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/members?search=${encodeURIComponent(q)}&limit=10`);
      const data = await res.json();
      setMembers(data.members ?? []);
    } finally {
      setSearching(false);
    }
  }, []);

  const selectMember = async (member: Member) => {
    setSelectedMember(member);
    setMembers([]);
    setSearchText(member.name + ' (' + member.accountNo + ')');
    // Fetch their deposit accounts
    const res = await fetch(`/api/savings/deposits?search=${member.accountNo}&limit=10`);
    const data = await res.json();
    const memberAccs = (data.deposits ?? []).filter((d: MemberAccount) => d.status === 'active');
    setAccounts(memberAccs);
    if (memberAccs.length > 0) setSelectedAccountId(memberAccs[0]._id);
  };

  const handleSave = async () => {
    if (!selectedMember || !selectedAccountId || !amount || Number(amount) <= 0) {
      alert('Please select a member, account, and enter an amount');
      return;
    }
    setSaving(true);
    try {
      const emp = employees.find(e => e._id === collectedBy);
      const res = await fetch('/api/savings/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMember._id,
          memberName: selectedMember.name,
          accountId: selectedAccountId,
          accountNo: selectedMember.accountNo,
          amount: Number(amount),
          date: new Date(date),
          collectedBy: emp?.name ?? 'Staff',
          type: 'savings',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to post collection');
        return;
      }

      alert(`Deposit of ৳${Number(amount).toLocaleString()} received from ${selectedMember.name}. Receipt posted.`);
      // Reset
      setSelectedMember(null);
      setAccounts([]);
      setSelectedAccountId('');
      setAmount('');
      setSearchText('');
    } finally {
      setSaving(false);
    }
  };

  const selectedAccount = accounts.find(a => a._id === selectedAccountId);

  return (
    <AppLayout>
      <PageHeader
        title="Daily Savings Collection Counter"
        subtitle="Record daily, weekly, or monthly savings deposit receipts from members."
        breadcrumbs={[{ label: 'Savings', href: '/savings/deposits' }, { label: 'Collection Counter' }]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-5 max-w-2xl mx-auto">
        {/* Member Search */}
        <div className="relative">
          <label className="block font-bold text-slate-700 mb-1 text-xs">Search Member Account</label>
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={e => {
                setSearchText(e.target.value);
                setSelectedMember(null);
                searchMembers(e.target.value);
              }}
              placeholder="Type name, account no, or mobile..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold pr-8"
            />
            {searching && <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
          </div>
          {members.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100 max-h-52 overflow-y-auto">
              {members.map(m => (
                <button
                  key={m._id}
                  onClick={() => selectMember(m)}
                  className="w-full px-4 py-2.5 text-left text-xs hover:bg-blue-50 transition-colors"
                >
                  <span className="font-bold text-slate-900">{m.name}</span>
                  <span className="text-slate-400 ml-2">({m.accountNo})</span>
                  <span className="text-slate-500 ml-2">| {m.mobile}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Member Info Card */}
        {selectedMember && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
            <h4 className="font-bold text-blue-900 text-sm">{selectedMember.name}</h4>
            <p className="text-slate-600 text-xs">Account: {selectedMember.accountNo} | Total Savings: ৳ {selectedMember.totalDeposit.toLocaleString()}</p>
            {accounts.length === 0 && <p className="text-rose-500 text-xs font-semibold">No active savings accounts found</p>}
          </div>
        )}

        {/* Account Select */}
        {accounts.length > 0 && (
          <div>
            <label className="block font-bold text-slate-700 mb-1 text-xs">Select Savings Account</label>
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
            >
              {accounts.map(a => (
                <option key={a._id} value={a._id}>
                  {a.type} — Balance: ৳ {a.balance.toLocaleString()}
                </option>
              ))}
            </select>
            {selectedAccount && (
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                Current Balance: ৳ {selectedAccount.balance.toLocaleString()} | Type: {selectedAccount.type}
              </p>
            )}
          </div>
        )}

        {/* Date */}
        <div>
          <label className="block font-bold text-slate-700 mb-1 text-xs">Transaction Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
        </div>

        {/* Amount */}
        <div>
          <label className="block font-bold text-slate-700 mb-1 text-xs">Deposit Collection Amount (৳)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xl font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>

        {/* Collector */}
        <div>
          <label className="block font-bold text-slate-700 mb-1 text-xs">Collector / Field Officer</label>
          <select
            value={collectedBy}
            onChange={e => setCollectedBy(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
          >
            {employees.map(e => (
              <option key={e._id} value={e._id}>{e.name} ({e.designation})</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !selectedMember || !amount}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-md transition-colors disabled:opacity-50"
        >
          {saving ? 'Posting...' : 'Post Collection & Generate Receipt'}
        </button>
      </div>
    </AppLayout>
  );
}
