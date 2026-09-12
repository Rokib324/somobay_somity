'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_TIER, ROLE_ICONS, ROLE_COLORS } from '@/lib/auth-shared';
import type { UserRole } from '@/models/User';

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAuth();

  const required = (searchParams.get('required') || 'Operations In-Charge') as UserRole;
  const current = (searchParams.get('current') || user?.role || 'Teller') as UserRole;

  const requiredTier = ROLE_TIER[required] ?? 0;
  const currentTier = ROLE_TIER[current] ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400"></div>
          <div className="p-10 text-center">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-red-50 border-2 border-red-100 flex items-center justify-center">
              <i className="fa-solid fa-shield-exclamation text-red-500 text-3xl"></i>
            </div>

            <h1 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              You do not have the required authorization level to access this resource.
            </p>

            {/* Role comparison */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Your Role</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${ROLE_COLORS[current] ?? ''}`}>
                  <i className={`fa-solid ${ROLE_ICONS[current] ?? 'fa-user'} text-xs`}></i>
                  {current}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Authority Level: <span className="font-bold text-slate-700">{currentTier}/5</span>
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-left">
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2">Required Role</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${ROLE_COLORS[required] ?? ''}`}>
                  <i className={`fa-solid ${ROLE_ICONS[required] ?? 'fa-user'} text-xs`}></i>
                  {required}
                </div>
                <p className="text-[11px] text-red-600 mt-2">
                  Authority Level: <span className="font-bold">{requiredTier}/5</span>
                </p>
              </div>
            </div>

            {/* Tier bar */}
            <div className="mt-6">
              <div className="flex items-center gap-1 mb-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`h-2 flex-1 rounded-full transition-all ${
                    i < currentTier ? 'bg-blue-500' : i < requiredTier ? 'bg-red-200' : 'bg-slate-100'
                  }`}></div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500">Your access tier vs. required tier</p>
            </div>

            <p className="text-xs text-slate-500 mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
              Contact your <strong>Branch Manager</strong> or <strong>System Administrator</strong> if you need elevated access for this function.
            </p>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button onClick={() => router.back()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                <i className="fa-solid fa-arrow-left text-xs"></i>Go Back
              </button>
              <button onClick={() => router.push('/dashboard')}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                <i className="fa-solid fa-house text-xs"></i>Dashboard
              </button>
            </div>

            <button onClick={logout}
              className="mt-3 w-full py-2 text-xs text-slate-400 hover:text-red-500 transition-colors">
              Sign out and switch accounts
            </button>
          </div>
        </div>

        {/* Audit notice */}
        <p className="text-center text-[11px] text-slate-400 mt-4">
          <i className="fa-solid fa-circle-info mr-1"></i>
          This access attempt has been logged for compliance and audit purposes.
        </p>
      </div>
    </div>
  );
}
