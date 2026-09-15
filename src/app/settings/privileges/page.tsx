'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
  COOPERATIVE_ROLES,
  LEGACY_ROLES,
  ALL_ROLES,
  ROLE_COLORS,
  ROLE_ICONS,
  ROLE_TIER,
  isChairman,
  type UserRole,
  type CooperativeRole,
} from '@/lib/auth-shared';
import {
  MENU_CATALOG,
  DEFAULT_ROLE_SLUGS,
  type MenuCatalogItem,
} from '@/lib/permissions';

interface RolePrivilegeData {
  role: string;
  menuSlugs: string[];
  hasDbRecord?: boolean;
}

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
  role: UserRole;
  branch: string;
  status: 'Active' | 'Inactive' | 'Locked';
  lastLogin?: string;
  createdAt: string;
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  'Chairman': 'Chief Executive Authority. Complete access to all financial, operational modules and exclusive authority to manage role privileges and assign roles.',
  'Vice Chairman': 'Senior Executive Authority. Full operational and oversight control across all modules, excluding role privilege distribution.',
  'Secretary': 'Executive Administrator. Manages membership records, loan operations, general ledgers, official communications, and HR records.',
  'Treasurer': 'Chief Financial Custodian. Oversees chart of accounts, vouchers, savings deposits, withdrawals, cost centers, and financial statements.',
  'Officer': 'Branch Operations Officer. Handles member onboarding, loan applications, schedule tracking, and field savings collections.',
  'Field Employee': 'Grassroots Field Operative. Dedicated access to daily field collection sheets, centralized deposits, and member inquiry desks.',
  'Super Admin': 'Legacy Administrator. Equivalent to Chairman-level operational authority.',
  'Branch Manager': 'Branch Leadership. Comprehensive management of branch-level transactions and operations.',
  'Operations In-Charge': 'Operations Supervisor. Oversees day-to-day transactions and approvals.',
  'Teller': 'Front-Desk Cashier. Counter cash transactions, deposits, and withdrawal processing.',
  'Back-Office': 'Back-Office Support. Routine record updates, verifications, and compliance logs.',
};

export default function PrivilegeMatrixPage() {
  const { user, isChairmanUser, refreshUser } = useAuth();

  // Active view tab: 'matrix' or 'assignment'
  const [activeTab, setActiveTab] = useState<'matrix' | 'assignment'>('matrix');

  // Matrix Editor State
  const [selectedRole, setSelectedRole] = useState<string>('Officer');
  const [privilegeMap, setPrivilegeMap] = useState<Record<string, string[]>>({});
  const [initialPrivilegeMap, setInitialPrivilegeMap] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Loading & Action States
  const [isLoadingMatrix, setIsLoadingMatrix] = useState(true);
  const [isSavingMatrix, setIsSavingMatrix] = useState(false);
  const [saveSuccessRole, setSaveSuccessRole] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Users Assignment State
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);

  const canEdit = isChairman(user?.role ?? '');

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // ── Fetch Role Privileges ──────────────────────────────────────────────────
  const fetchPrivileges = useCallback(async () => {
    setIsLoadingMatrix(true);
    try {
      const res = await fetch('/api/rbac/roles');
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, string[]> = {};
        if (Array.isArray(data.roles)) {
          data.roles.forEach((r: RolePrivilegeData) => {
            map[r.role] = r.menuSlugs;
          });
        }
        // Fill in any missing roles with defaults
        ALL_ROLES.forEach(r => {
          if (!map[r]) {
            map[r] = DEFAULT_ROLE_SLUGS[r] ?? [];
          }
        });
        setPrivilegeMap(map);
        setInitialPrivilegeMap(JSON.parse(JSON.stringify(map)));
      } else {
        // Fallback for non-chairmen viewing default matrix
        const map: Record<string, string[]> = {};
        ALL_ROLES.forEach(r => {
          map[r] = DEFAULT_ROLE_SLUGS[r] ?? [];
        });
        setPrivilegeMap(map);
        setInitialPrivilegeMap(JSON.parse(JSON.stringify(map)));
      }
    } catch {
      const map: Record<string, string[]> = {};
      ALL_ROLES.forEach(r => {
        map[r] = DEFAULT_ROLE_SLUGS[r] ?? [];
      });
      setPrivilegeMap(map);
      setInitialPrivilegeMap(JSON.parse(JSON.stringify(map)));
    } finally {
      setIsLoadingMatrix(false);
    }
  }, []);

  // ── Fetch Users List ───────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    if (!canEdit) return;
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/rbac/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users ?? []);
      }
    } catch {
      // Ignored
    } finally {
      setIsLoadingUsers(false);
    }
  }, [canEdit]);

  useEffect(() => {
    fetchPrivileges();
  }, [fetchPrivileges]);

  useEffect(() => {
    if (activeTab === 'assignment' && canEdit) {
      fetchUsers();
    }
  }, [activeTab, canEdit, fetchUsers]);

  // Current role's selected slugs
  const currentSlugs = useMemo(() => {
    return new Set(privilegeMap[selectedRole] ?? []);
  }, [privilegeMap, selectedRole]);

  // Dirty state detection for current role
  const isDirty = useMemo(() => {
    const current = privilegeMap[selectedRole] ?? [];
    const initial = initialPrivilegeMap[selectedRole] ?? [];
    if (current.length !== initial.length) return true;
    const initialSet = new Set(initial);
    return current.some(s => !initialSet.has(s));
  }, [privilegeMap, initialPrivilegeMap, selectedRole]);

  // Group MENU_CATALOG items by Module Group
  const groupedMenus = useMemo(() => {
    const groups: Record<string, { parent?: MenuCatalogItem; children: MenuCatalogItem[] }> = {};

    MENU_CATALOG.forEach(item => {
      const g = item.group;
      if (!groups[g]) {
        groups[g] = { children: [] };
      }
      if (!item.parentSlug) {
        groups[g].parent = item;
      } else {
        groups[g].children.push(item);
      }
    });

    return groups;
  }, []);

  // Filtered grouped menus based on search
  const filteredGroupedMenus = useMemo(() => {
    if (!searchQuery.trim()) return groupedMenus;
    const q = searchQuery.toLowerCase();

    const result: typeof groupedMenus = {};

    Object.entries(groupedMenus).forEach(([groupName, groupData]) => {
      const parentMatches = groupData.parent && (
        groupData.parent.label.toLowerCase().includes(q) ||
        groupData.parent.slug.toLowerCase().includes(q) ||
        groupData.parent.href.toLowerCase().includes(q)
      );

      const matchedChildren = groupData.children.filter(child =>
        child.label.toLowerCase().includes(q) ||
        child.slug.toLowerCase().includes(q) ||
        child.href.toLowerCase().includes(q)
      );

      if (parentMatches || matchedChildren.length > 0 || groupName.toLowerCase().includes(q)) {
        result[groupName] = {
          parent: groupData.parent,
          children: matchedChildren.length > 0 ? matchedChildren : groupData.children,
        };
      }
    });

    return result;
  }, [groupedMenus, searchQuery]);

  // ── Toggle Single Slug ─────────────────────────────────────────────────────
  const toggleSlug = (slug: string) => {
    if (!canEdit) return;
    setPrivilegeMap(prev => {
      const current = prev[selectedRole] ? [...prev[selectedRole]] : [];
      const index = current.indexOf(slug);
      if (index >= 0) {
        current.splice(index, 1);
      } else {
        current.push(slug);
      }
      return { ...prev, [selectedRole]: current };
    });
  };

  // ── Toggle Entire Group ────────────────────────────────────────────────────
  const toggleGroup = (groupName: string, items: MenuCatalogItem[], enable: boolean) => {
    if (!canEdit) return;
    const groupSlugs = items.map(i => i.slug);
    setPrivilegeMap(prev => {
      const current = new Set(prev[selectedRole] ?? []);
      if (enable) {
        groupSlugs.forEach(s => current.add(s));
      } else {
        groupSlugs.forEach(s => current.delete(s));
      }
      return { ...prev, [selectedRole]: Array.from(current) };
    });
  };

  // ── Select All / Deselect All ──────────────────────────────────────────────
  const handleSelectAll = (select: boolean) => {
    if (!canEdit) return;
    setPrivilegeMap(prev => ({
      ...prev,
      [selectedRole]: select ? MENU_CATALOG.map(m => m.slug) : [],
    }));
  };

  // ── Reset to Role Defaults ────────────────────────────────────────────────
  const handleResetToDefaults = () => {
    if (!canEdit) return;
    const defaults = DEFAULT_ROLE_SLUGS[selectedRole] ?? [];
    setPrivilegeMap(prev => ({
      ...prev,
      [selectedRole]: [...defaults],
    }));
  };

  // ── Save Privileges to Backend ─────────────────────────────────────────────
  const handleSavePrivileges = async () => {
    if (!canEdit) return;
    setIsSavingMatrix(true);
    try {
      const res = await fetch('/api/rbac/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          menuSlugs: privilegeMap[selectedRole] ?? [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save privileges');
      }

      setInitialPrivilegeMap(JSON.parse(JSON.stringify(privilegeMap)));
      setSaveSuccessRole(selectedRole);
      setToastMessage({
        type: 'success',
        text: `Privileges for "${selectedRole}" updated successfully! Navigation menus will reflect changes on next load.`,
      });
      setTimeout(() => setSaveSuccessRole(null), 3000);

      // Refresh logged-in user context in case chairman modified their own role
      await refreshUser();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update role privileges.';
      setToastMessage({ type: 'error', text: msg });
    } finally {
      setIsSavingMatrix(false);
    }
  };

  // ── Assign Role to User ───────────────────────────────────────────────────
  const handleAssignRole = async (targetUserId: string, targetName: string, newRole: string) => {
    if (!canEdit) return;
    setAssigningUserId(targetUserId);
    try {
      const res = await fetch('/api/rbac/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to assign role');
      }

      setUsersList(prev =>
        prev.map(u => (u._id === targetUserId ? { ...u, role: newRole as UserRole } : u))
      );

      setToastMessage({
        type: 'success',
        text: `Role for "${targetName}" successfully changed to ${newRole}.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Role assignment failed.';
      setToastMessage({ type: 'error', text: msg });
    } finally {
      setAssigningUserId(null);
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.employeeId && u.employeeId.toLowerCase().includes(userSearch.toLowerCase()));
      const matchBranch = branchFilter === 'ALL' || u.branch === branchFilter;
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchSearch && matchBranch && matchRole;
    });
  }, [usersList, userSearch, branchFilter, roleFilter]);

  // Unique branches for filter
  const branchList = useMemo(() => {
    const branches = new Set(usersList.map(u => u.branch).filter(Boolean));
    return Array.from(branches);
  }, [usersList]);

  return (
    <AppLayout>
      <PageHeader
        title="Role-Based Menu Privilege System"
        subtitle="Manage dynamic menu visibility and operational authority per role with strict RBAC."
        breadcrumbs={[{ label: 'Settings', href: '/settings' }, { label: 'Privileges Matrix' }]}
        action={
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                canEdit ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              <i className={`fa-solid ${canEdit ? 'fa-shield-halved' : 'fa-lock'} text-xs`}></i>
              {canEdit ? 'Chairman Authority: Full Edit' : 'Read-Only Mode'}
            </span>
          </div>
        }
      />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/95 text-emerald-100 border-emerald-500/40 shadow-emerald-900/40'
              : 'bg-rose-900/95 text-rose-100 border-rose-500/40 shadow-rose-900/40'
          }`}
        >
          <i
            className={`fa-solid ${
              toastMessage.type === 'success' ? 'fa-circle-check text-emerald-400' : 'fa-circle-exclamation text-rose-400'
            } text-lg`}
          ></i>
          <span className="text-xs font-semibold">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-300 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* Main View Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'matrix'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fa-solid fa-table-cells text-sm"></i>
          Role Menu Matrix
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-bold">
            {MENU_CATALOG.length} Routes
          </span>
        </button>

        <button
          onClick={() => setActiveTab('assignment')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'assignment'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fa-solid fa-user-shield text-sm"></i>
          User Role Distribution
          {canEdit && (
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              Admin Only
            </span>
          )}
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: PRIVILEGE MATRIX */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Read-Only Notice for Non-Chairman */}
          {!canEdit && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="fa-solid fa-lock text-sm"></i>
              </div>
              <div className="text-xs">
                <p className="font-bold text-amber-900">Privilege Matrix is in Read-Only Mode</p>
                <p className="text-amber-700 mt-0.5">
                  You are logged in as <strong className="font-bold">{user?.role}</strong> (Tier {ROLE_TIER[user?.role ?? ''] ?? 1}).
                  According to cooperative governance rules, only the <strong>Chairman</strong> has administrative privilege to modify menu access or redistribute roles.
                </p>
              </div>
            </div>
          )}

          {/* Role Hierarchy Selector Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Select Role to Configure
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click a role pill below to inspect and customize its authorized navigation tree.
                </p>
              </div>

              {/* Matrix Action Buttons (Chairman Only) */}
              {canEdit && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleSelectAll(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <i className="fa-solid fa-check-double mr-1.5 text-slate-500"></i>Select All
                  </button>
                  <button
                    onClick={() => handleSelectAll(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <i className="fa-solid fa-xmark mr-1.5 text-slate-500"></i>Clear All
                  </button>
                  <button
                    onClick={handleResetToDefaults}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    title="Reset to factory preset defaults"
                  >
                    <i className="fa-solid fa-rotate-left mr-1.5 text-slate-500"></i>Reset Defaults
                  </button>

                  <button
                    onClick={handleSavePrivileges}
                    disabled={isSavingMatrix || !isDirty}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-md transition-all ${
                      isDirty
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 ring-2 ring-blue-500/20'
                        : 'bg-slate-400 cursor-not-allowed opacity-75'
                    }`}
                  >
                    {isSavingMatrix ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                        Saving...
                      </>
                    ) : saveSuccessRole === selectedRole ? (
                      <>
                        <i className="fa-solid fa-check text-xs"></i>
                        Saved!
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-floppy-disk text-xs"></i>
                        Save Privileges {isDirty && '•'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Cooperative Roles Pills */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Cooperative Hierarchy
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {COOPERATIVE_ROLES.map(role => {
                  const isSelected = selectedRole === role;
                  const tier = ROLE_TIER[role] ?? 1;
                  const count = privilegeMap[role]?.length ?? 0;
                  const icon = ROLE_ICONS[role] || 'fa-user';

                  return (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`relative p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-700 shadow-sm'
                          }`}
                        >
                          <i className={`fa-solid ${icon}`}></i>
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          Tier {tier}
                        </span>
                      </div>
                      <p className="font-bold text-xs mt-2 truncate">{role}</p>
                      <p className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                        {count} / {MENU_CATALOG.length} Menus
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legacy Roles Accordion/Row */}
            <details className="text-xs group">
              <summary className="cursor-pointer text-slate-500 hover:text-slate-700 font-semibold flex items-center gap-1.5 py-1">
                <i className="fa-solid fa-chevron-right text-[10px] transition-transform group-open:rotate-90"></i>
                Show Legacy Roles ({LEGACY_ROLES.join(', ')})
              </summary>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2 pt-2 border-t border-slate-100">
                {LEGACY_ROLES.map(role => {
                  const isSelected = selectedRole === role;
                  const count = privilegeMap[role]?.length ?? 0;
                  return (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`p-2 rounded-lg border text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <p className="font-bold truncate">{role}</p>
                      <p className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {count} Menus
                      </p>
                    </button>
                  );
                })}
              </div>
            </details>

            {/* Selected Role Meta Banner */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border ${ROLE_COLORS[selectedRole] ?? 'bg-slate-100'}`}>
                  <i className={`fa-solid ${ROLE_ICONS[selectedRole] || 'fa-user'}`}></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{selectedRole}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Tier {ROLE_TIER[selectedRole] ?? 1} Authority
                    </span>
                    {isDirty && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                        Unsaved Changes
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5 max-w-2xl">
                    {ROLE_DESCRIPTIONS[selectedRole] ?? 'Operational user role within Somity Online ERP.'}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-lg font-black text-blue-600">
                  {currentSlugs.size}
                </span>
                <span className="text-xs text-slate-400 font-bold"> / {MENU_CATALOG.length}</span>
                <p className="text-[10px] text-slate-500 font-medium">Authorized Routes</p>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search menus by title, slug, or path..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <i className="fa-solid fa-xmark text-xs"></i>
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-500 font-semibold self-end sm:self-auto">
              Showing {Object.keys(filteredGroupedMenus).length} Modules
            </div>
          </div>

          {/* Module-by-Module Privilege Grid */}
          <div className="space-y-4">
            {Object.entries(filteredGroupedMenus).map(([groupName, groupData]) => {
              const allItems = [
                ...(groupData.parent ? [groupData.parent] : []),
                ...groupData.children,
              ];
              const enabledCount = allItems.filter(i => currentSlugs.has(i.slug)).length;
              const allEnabled = allItems.length > 0 && enabledCount === allItems.length;
              const isCollapsed = Boolean(collapsedGroups[groupName]);

              return (
                <div
                  key={groupName}
                  className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden transition-all"
                >
                  {/* Module Header Bar */}
                  <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setCollapsedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }))
                        }
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <i
                          className={`fa-solid fa-chevron-down text-xs transition-transform ${
                            isCollapsed ? '-rotate-90' : ''
                          }`}
                        ></i>
                      </button>

                      {groupData.parent?.icon && (
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                          <i className={groupData.parent.icon}></i>
                        </div>
                      )}

                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          {groupName}
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          {enabledCount} of {allItems.length} sub-routes enabled
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => toggleGroup(groupName, allItems, !allEnabled)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                            allEnabled
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          }`}
                        >
                          {allEnabled ? 'Deselect Module' : 'Enable All'}
                        </button>
                      )}

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          enabledCount === 0
                            ? 'bg-slate-100 text-slate-500'
                            : allEnabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {enabledCount} / {allItems.length}
                      </span>
                    </div>
                  </div>

                  {/* Module Routes List */}
                  {!isCollapsed && (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {allItems.map(item => {
                        const isChecked = currentSlugs.has(item.slug);
                        const isParent = !item.parentSlug;

                        return (
                          <label
                            key={item.slug}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                              canEdit ? 'cursor-pointer' : 'cursor-default'
                            } ${
                              isChecked
                                ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={!canEdit}
                              onChange={() => toggleSlug(item.slug)}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {item.icon && (
                                  <i className={`${item.icon} text-slate-400 text-[10px]`}></i>
                                )}
                                <span className={`text-xs font-bold truncate ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>
                                  {item.label}
                                </span>
                                {isParent && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                                    Parent
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                                {item.href}
                              </p>
                              <span className="text-[9px] text-slate-400 font-mono">
                                slug: {item.slug}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: USER ROLE ASSIGNMENT (CHAIRMAN ONLY) */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'assignment' && (
        <div className="space-y-6">
          {!canEdit ? (
            <div className="p-8 bg-white rounded-xl border border-slate-200 card-shadow text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto">
                <i className="fa-solid fa-hand"></i>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Access Restricted: Chairman Only</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Only employees holding the <strong className="font-bold text-slate-800">Chairman</strong> role have authority to reassign operational roles, promote staff, or adjust access tiers.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6">
              {/* Filter and Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search by employee name, email, or ID..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={branchFilter}
                    onChange={e => setBranchFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
                  >
                    <option value="ALL">All Branches</option>
                    {branchList.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>

                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
                  >
                    <option value="ALL">All Roles</option>
                    {ALL_ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Employee ID</th>
                      <th className="py-3 px-4">Branch</th>
                      <th className="py-3 px-4">Current Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Assign New Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingUsers ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          <i className="fa-solid fa-spinner fa-spin mr-2"></i>Loading employees...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No matching employees found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(emp => {
                        const isSelf = emp._id === user?.id;
                        const roleColor = ROLE_COLORS[emp.role] ?? 'bg-slate-100 text-slate-700';
                        const isAssigning = assigningUserId === emp._id;

                        return (
                          <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                                  {emp.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-slate-900">{emp.name}</p>
                                    {isSelf && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-400">{emp.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-500">
                              {emp.employeeId || '—'}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                              {emp.branch}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${roleColor}`}>
                                <i className={`fa-solid ${ROLE_ICONS[emp.role] || 'fa-user'} text-[9px]`}></i>
                                {emp.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  emp.status === 'Active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {emp.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                {isAssigning ? (
                                  <span className="text-xs text-blue-600 font-semibold">
                                    <i className="fa-solid fa-spinner fa-spin mr-1"></i>Updating...
                                  </span>
                                ) : (
                                  <select
                                    value={emp.role}
                                    disabled={isSelf}
                                    onChange={e => handleAssignRole(emp._id, emp.name, e.target.value)}
                                    className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <optgroup label="Cooperative Hierarchy">
                                      {COOPERATIVE_ROLES.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Legacy Roles">
                                      {LEGACY_ROLES.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                      ))}
                                    </optgroup>
                                  </select>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
