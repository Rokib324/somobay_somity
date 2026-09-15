'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AddMenuPage() {
  const { user, isChairmanUser } = useAuth();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [path, setPath] = useState('');
  const [icon, setIcon] = useState('fa-solid fa-file-lines');
  const [group, setGroup] = useState('CORE OPERATIVE');
  const [parentSlug, setParentSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const canEdit = isChairmanUser || user?.role === 'Chairman' || user?.role === 'Super Admin';

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
      const generated = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      setSlug(generated);
      if (!path) {
        setPath(`/${generated}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(`Menu "${title}" registered successfully! It is now available in the Privilege Matrix.`);
      setTitle('');
      setSlug('');
      setPath('');
    }, 600);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Add Dynamic Navigation Menu Item"
        subtitle="Register custom dynamic navigation routes and FontAwesome icons into the ERP sidebar."
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Privileges', href: '/settings/privileges' },
          { label: 'Add Menu' },
        ]}
      />

      {!canEdit ? (
        <div className="p-8 bg-white rounded-xl border border-slate-200 card-shadow text-center space-y-3 max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl mx-auto">
            <i className="fa-solid fa-lock"></i>
          </div>
          <h3 className="text-sm font-bold text-slate-900">Chairman Authorization Required</h3>
          <p className="text-xs text-slate-500">
            Only users with the Chairman or Super Admin role can register custom navigation items.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6 max-w-2xl mx-auto">
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-500 text-sm"></i>
                <span className="font-semibold">{successMessage}</span>
              </div>
              <Link
                href="/settings/privileges"
                className="font-bold underline hover:text-emerald-950 ml-3"
              >
                Go to Matrix
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Menu Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="e.g. Audit Logs"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Slug Identifier</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="e.g. audit-logs"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Route URL Path</label>
              <input
                type="text"
                required
                value={path}
                onChange={e => setPath(e.target.value)}
                placeholder="e.g. /audit-logs"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Module Group</label>
                <select
                  value={group}
                  onChange={e => setGroup(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="CORE OPERATIVE">CORE OPERATIVE</option>
                  <option value="ACCOUNTS MODULE">ACCOUNTS MODULE</option>
                  <option value="MEMBERS MODULE">MEMBERS MODULE</option>
                  <option value="SAVINGS & DEPOSITS">SAVINGS & DEPOSITS</option>
                  <option value="LOANS & COLLECTIONS">LOANS & COLLECTIONS</option>
                  <option value="HUMAN RESOURCES">HUMAN RESOURCES</option>
                  <option value="ADMIN & SYSTEM">ADMIN & SYSTEM</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">FontAwesome Icon</label>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-sm flex-shrink-0">
                    <i className={icon}></i>
                  </div>
                  <input
                    type="text"
                    value={icon}
                    onChange={e => setIcon(e.target.value)}
                    placeholder="e.g. fa-solid fa-clipboard-check"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Registering Route...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-plus"></i>
                    Register New Navigation Route
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
