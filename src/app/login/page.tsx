'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const BRANCHES = [
  'Head Office (Dhaka)',
  'Uttara Branch',
  'Gulshan Branch',
  'Mirpur Branch',
];

const REASON_MESSAGES: Record<string, string> = {
  unauthenticated: 'Please sign in to access the system.',
  session_expired: 'Your session has expired. Please sign in again.',
  unauthorized: 'You do not have permission to access that page.',
};

function ChangePasswordForm({ onSuccess }: { onSuccess: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (next !== confirm) { setError('Passwords do not match.'); return; }
    if (next.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (res.ok) { onSuccess(); }
      else { setError(data.error || 'Failed to change password.'); }
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
        <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5"></i>
        <div>
          <p className="text-sm font-bold text-amber-800">Password Change Required</p>
          <p className="text-xs text-amber-700 mt-0.5">You must set a new password before continuing. Your new password must be at least 8 characters with an uppercase letter and a number.</p>
        </div>
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex gap-2">
          <i className="fa-solid fa-circle-xmark text-red-500 mt-0.5"></i>{error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Current Password</label>
          <div className="relative">
            <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input type={showCurrent ? 'text' : 'password'} required value={current} onChange={e => setCurrent(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <i className={`fa-solid ${showCurrent ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">New Password</label>
          <div className="relative">
            <i className="fa-solid fa-key absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input type={showNext ? 'text' : 'password'} required value={next} onChange={e => setNext(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
            <button type="button" onClick={() => setShowNext(!showNext)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <i className={`fa-solid ${showNext ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Confirm New Password</label>
          <div className="relative">
            <i className="fa-solid fa-shield-check absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-2">
          {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Updating...</> : <><i className="fa-solid fa-check"></i>Set New Password</>}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [branch, setBranch] = useState(BRANCHES[0]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [unlockMinutes, setUnlockMinutes] = useState(0);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const reason = searchParams.get('reason');
  const nextPath = searchParams.get('next') || '/dashboard';

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(nextPath);
    }
  }, [user, isLoading, router, nextPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAttemptsRemaining(null);
    setLocked(false);
    setLoading(true);

    const result = await login({ email, password, branch });

    if (result.success) {
      if (result.mustChangePassword) {
        setMustChangePassword(true);
        setLoading(false);
        return;
      }
      router.replace(nextPath);
    } else {
      setError(result.error || 'Login failed.');
      if (result.locked) {
        setLocked(true);
        setUnlockMinutes(result.unlockMinutes || 30);
      } else if (typeof result.attemptsRemaining === 'number') {
        setAttemptsRemaining(result.attemptsRemaining);
      }
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden p-4">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl -top-40 -left-40 animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -bottom-32 -right-32 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Security badge top */}
      <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
        <i className="fa-solid fa-shield-halved text-emerald-400 text-sm"></i>
        <span className="text-xs font-semibold text-white/70">256-bit Encrypted</span>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/40 mb-4 relative">
            <i className="fa-solid fa-building-columns text-white text-3xl"></i>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-check text-white text-[10px]"></i>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Somobay Somity</h1>
          <p className="text-blue-300 text-sm mt-1 font-medium">Co-Operative Financial Management System</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            {[
              { label: 'Secure', icon: 'fa-lock' },
              { label: 'Compliant', icon: 'fa-certificate' },
              { label: 'Enterprise', icon: 'fa-building' },
            ].map(tag => (
              <div key={tag.label} className="flex items-center gap-1.5 text-blue-400/70">
                <i className={`fa-solid ${tag.icon} text-[10px]`}></i>
                <span className="text-[11px] font-semibold uppercase tracking-wider">{tag.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/98 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
          {/* Card top bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

          <div className="p-8">
            {/* Session reason banner */}
            {reason && REASON_MESSAGES[reason] && (
              <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex gap-2.5 items-start">
                <i className="fa-solid fa-circle-info text-amber-500 mt-0.5 text-sm"></i>
                <p className="text-xs text-amber-800 font-medium">{REASON_MESSAGES[reason]}</p>
              </div>
            )}

            {mustChangePassword ? (
              <>
                <div className="mb-5">
                  <h2 className="text-xl font-extrabold text-slate-900">Set New Password</h2>
                  <p className="text-xs text-slate-500 mt-1">For security, please update your password.</p>
                </div>
                <ChangePasswordForm onSuccess={() => router.replace(nextPath)} />
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-slate-900">Staff Sign In</h2>
                  <p className="text-xs text-slate-500 mt-1">Enter your credentials to access the ERP portal.</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className={`mb-4 p-3.5 rounded-xl border flex gap-2.5 items-start text-xs ${locked ? 'bg-red-50 border-red-300 text-red-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    <i className={`fa-solid ${locked ? 'fa-lock' : 'fa-circle-exclamation'} mt-0.5 flex-shrink-0 ${locked ? 'text-red-600' : 'text-red-500'}`}></i>
                    <div>
                      <p className="font-semibold">{locked ? `Account Locked (${unlockMinutes} min)` : 'Authentication Failed'}</p>
                      <p className="mt-0.5 leading-relaxed">{error}</p>
                      {attemptsRemaining !== null && !locked && (
                        <div className="mt-2 flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full ${i < (5 - (attemptsRemaining ?? 0)) ? 'bg-red-400' : 'bg-slate-200'}`}></div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Branch */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Branch Office <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <i className="fa-solid fa-code-branch absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"></i>
                      <select value={branch} onChange={e => setBranch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer">
                        {BRANCHES.map(b => <option key={b}>{b}</option>)}
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                    </div>
                  </div>

                  {/* Email / Employee ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <i className="fa-solid fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"></i>
                      <input type="email" required placeholder="staff@somity.com" value={email}
                        onChange={e => setEmail(e.target.value)} autoComplete="email"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-300" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <button type="button" className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"></i>
                      <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                        value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"
                        className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-300" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1">
                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={loading || locked}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 mt-2 group">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Authenticating...</>
                    ) : locked ? (
                      <><i className="fa-solid fa-lock"></i>Account Locked</>
                    ) : (
                      <><i className="fa-solid fa-right-to-bracket"></i>Sign In to ERP Portal<i className="fa-solid fa-arrow-right text-xs opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all"></i></>
                    )}
                  </button>
                </form>

                {/* Role guide */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Access Levels</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { role: 'Super Admin', icon: 'fa-crown', color: 'text-purple-600 bg-purple-50 border-purple-100' },
                      { role: 'Branch Manager', icon: 'fa-building-columns', color: 'text-blue-600 bg-blue-50 border-blue-100' },
                      { role: 'Operations In-Charge', icon: 'fa-shield-halved', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                      { role: 'Teller', icon: 'fa-cash-register', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                      { role: 'Back-Office', icon: 'fa-magnifying-glass-chart', color: 'text-amber-600 bg-amber-50 border-amber-100' },
                    ].map(item => (
                      <div key={item.role} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold ${item.color}`}>
                        <i className={`fa-solid ${item.icon} text-xs`}></i>
                        <span>{item.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-[11px] text-blue-300/60 space-y-1">
          <p>Protected by enterprise-grade security. Unauthorized access is prohibited.</p>
          <p>© {new Date().getFullYear()} Somobay Somity — All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
