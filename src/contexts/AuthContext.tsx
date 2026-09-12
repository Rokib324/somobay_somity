'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SessionUser } from '@/lib/auth-shared';
import { hasMinRole, ROLE_TIER } from '@/lib/auth-shared';
import type { UserRole } from '@/models/User';

interface AuthContextType {
  user: SessionUser | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string; branch: string }) => Promise<{
    success: boolean;
    error?: string;
    locked?: boolean;
    unlockMinutes?: number;
    attemptsRemaining?: number;
    mustChangePassword?: boolean;
  }>;
  logout: () => Promise<void>;
  hasPermission: (minRole: UserRole) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

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
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  const hasPermission = useCallback(
    (minRole: UserRole): boolean => {
      if (!user) return false;
      return hasMinRole(user.role, minRole);
    },
    [user]
  );

  const hasRole = useCallback(
    (...roles: UserRole[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission, hasRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Re-export for convenience
export type { SessionUser };
export { ROLE_TIER };
