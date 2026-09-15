'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SessionUser } from '@/lib/auth-shared';
import { hasMinRole, ROLE_TIER, isChairman } from '@/lib/auth-shared';
import type { NavGroup } from '@/lib/permissions';

// ─── Context Shape ────────────────────────────────────────────────────────────
interface AuthContextType {
  user: SessionUser | null;
  isLoading: boolean;
  /** Authorized menu tree for the current user — from /api/rbac/menus */
  authorizedMenus: NavGroup[];
  /** True if the current user is Chairman or Super Admin */
  isChairmanUser: boolean;
  login: (credentials: { email: string; password: string; branch: string }) => Promise<{
    success: boolean;
    error?: string;
    locked?: boolean;
    unlockMinutes?: number;
    attemptsRemaining?: number;
    mustChangePassword?: boolean;
  }>;
  logout: () => Promise<void>;
  hasPermission: (minRole: string) => boolean;
  hasRole: (...roles: string[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authorizedMenus, setAuthorizedMenus] = useState<NavGroup[]>([]);
  const router = useRouter();

  // Fetch authorized menu tree for a given user session
  const fetchAuthorizedMenus = useCallback(async () => {
    try {
      const res = await fetch('/api/rbac/menus');
      if (res.ok) {
        const data = await res.json();
        setAuthorizedMenus(data.authorizedMenus ?? []);
      } else {
        setAuthorizedMenus([]);
      }
    } catch {
      setAuthorizedMenus([]);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        // Fetch fresh authorized menus whenever user session refreshes
        await fetchAuthorizedMenus();
      } else {
        setUser(null);
        setAuthorizedMenus([]);
      }
    } catch {
      setUser(null);
      setAuthorizedMenus([]);
    }
  }, [fetchAuthorizedMenus]);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (credentials: { email: string; password: string; branch: string }) => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setUser(data.user);
          // Fetch menus immediately after login
          await fetchAuthorizedMenus();
          return {
            success: true,
            mustChangePassword: data.mustChangePassword,
          };
        }

        return {
          success: false,
          error: data.error,
          locked: data.locked,
          unlockMinutes: data.unlockMinutes,
          attemptsRemaining: data.attemptsRemaining,
        };
      } catch {
        return { success: false, error: 'Network error. Please check your connection.' };
      }
    },
    [fetchAuthorizedMenus]
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setAuthorizedMenus([]);
      router.push('/login');
    }
  }, [router]);

  const hasPermission = useCallback(
    (minRole: string): boolean => {
      if (!user) return false;
      return hasMinRole(user.role, minRole);
    },
    [user]
  );

  const hasRole = useCallback(
    (...roles: string[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const isChairmanUser = user ? isChairman(user.role) : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        authorizedMenus,
        isChairmanUser,
        login,
        logout,
        hasPermission,
        hasRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Re-exports for convenience
export type { SessionUser, NavGroup };
export { ROLE_TIER };
