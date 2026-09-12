'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useRouter } from 'next/navigation';

interface DepositAccountItem {
  _id: string;
  accountNo: string;
  memberName: string;
  type: string;
  balance: number;
  branch: string;
}

const inputClass = 'w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300';

export default function ApplyWithdrawalPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<DepositAccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [reason, setReason] = useState('Personal necessity');
  const [paymentMethod, setPaymentMethod] = useState('Cash from Counter');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/savings/deposits?limit=100&status=active')
      .then(r => r.json())
      .then(d => {
        const accs = d.deposits || [];
        setAccounts(accs);
        if (accs.length > 0) setSelectedAccountId(accs[0]._id);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedAccount = accounts.find(a => a._id === selectedAccountId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) {
      alert('Please select a valid savings account');
      return;
    }
    const withdrawAmt = Number(amount);
    if (!withdrawAmt || withdrawAmt <= 0) {
      alert('Please enter a valid withdrawal amount');
      return;
    }
    if (withdrawAmt > selectedAccount.balance) {
      alert(`Withdrawal amount cannot exceed available balance of ৳ ${selectedAccount.balance.toLocaleString()}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/savings/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccount._id,
          amount: withdrawAmt,
          reason: `${reason} (${paymentMethod})`,
          appliedBy: 'Teller Staff',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to submit withdrawal requisition');
        return;
      }

      alert('Withdrawal requisition submitted successfully and placed in the Approval Queue!');
      router.push('/savings/withdrawals');
    } catch {
      alert('Network error while submitting requisition');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Apply for Savings Withdrawal Requisition"
        subtitle="Submit a formal withdrawal requisition for review, management approval, and vault disbursement."
        breadcrumbs={[
          { label: 'Savings', href: '/savings/deposits' },
          { label: 'Withdrawals', href: '/savings/withdrawals' },
          { label: 'Apply' },
        ]}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Savings Account *</label>
              <select
                className={inputClass}
                value={selectedAccountId}
                onChange={e => setSelectedAccountId(e.target.value)}
              >
                {accounts.map(a => (
                  <option key={a._id} value={a._id}>
                    {a.accountNo} — {a.memberName} | {a.type} (Balance: ৳ {a.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {selectedAccount && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-blue-900 block">{selectedAccount.memberName}</span>
                  <span className="text-[10px] text-blue-600 font-mono">{selectedAccount.accountNo} ({selectedAccount.type})</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-blue-700 block font-medium">Available Account Balance</span>
                  <span className="text-base font-black text-emerald-700 font-mono">
                    ৳ {selectedAccount.balance.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Withdrawal Amount (৳) *</label>
              <input
                type="number"
                min={1}
                max={selectedAccount?.balance || undefined}
                placeholder="Enter withdrawal amount"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-lg font-black text-rose-600 focus:ring-2 focus:ring-rose-300 focus:outline-none"
                value={amount}
                onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              />
              {selectedAccount && Number(amount) > selectedAccount.balance && (
                <p className="text-[10px] text-rose-600 font-bold mt-1">
                  Amount exceeds live balance of ৳ {selectedAccount.balance.toLocaleString()}!
                </p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Disbursement Method</label>
              <select
                className={inputClass}
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <option>Cash from Counter</option>
                <option>Bank Account Transfer (BEFTN / NPSB)</option>
                <option>Account Transfer to Another Member</option>
                <option>Cheque Disbursement</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Withdrawal</label>
              <textarea
                rows={2}
                placeholder="e.g. Medical emergency, business investment, family expenses"
                className={inputClass}
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/savings/withdrawals')}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || (selectedAccount ? Number(amount) > selectedAccount.balance : false)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs disabled:opacity-50 transition-colors shadow-sm"
              >
                {submitting ? 'Submitting Application...' : 'Submit Requisition for Approval'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
