'use client';

/**
 * RouteGuard — Client-side URL hijack prevention.
 *
 * Defense-in-depth: middleware handles server-side routing; this component
 * prevents manual URL navigation to restricted pages from the browser.
 *
 * On every pathname change it checks whether the current route is accessible
 * given the user's authorizedMenus. Unauthorized access → /unauthorized.
 */
import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Paths that are always accessible regardless of menu privileges
const ALWAYS_ALLOWED_PREFIXES = [
  '/login',
  '/unauthorized',
  '/api/',
  '/_next',
];

// Paths that are accessible to any authenticated user (not menu-restricted)
const AUTH_ONLY_PATHS = [
  '/settings',         // settings landing page (general)
  '/dashboard',
];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, authorizedMenus } = useAuth();
  const lastCheckedPath = useRef<string>('');

  useEffect(() => {
    // Skip check while loading auth state
    if (isLoading) return;

    // Skip if already checked this path
    if (lastCheckedPath.current === pathname) return;
    lastCheckedPath.current = pathname;

    // Not logged in → middleware will handle redirect, but guard defensively
    if (!user) return;

    // Always allow public paths
    if (ALWAYS_ALLOWED_PREFIXES.some(p => pathname.startsWith(p))) return;

    // Always allow auth-only paths
    if (AUTH_ONLY_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) return;

    // No menu data yet — wait for it (don't block)
    if (authorizedMenus.length === 0) return;

    // Collect all authorized hrefs from the menu tree
    const authorizedHrefs = new Set<string>();
    for (const group of authorizedMenus) {
      for (const item of group.items) {
        authorizedHrefs.add(item.href);
        for (const sub of item.submenu) {
          authorizedHrefs.add(sub.href);
        }
      }
    }

    // Check if the current pathname is in the authorized set
    // We do prefix matching for dynamic routes (e.g., /members/[id])
    const isAuthorized =
      authorizedHrefs.has(pathname) ||
      [...authorizedHrefs].some(
        href => href !== '/' && pathname.startsWith(href + '/')
      );

    if (!isAuthorized) {
      console.warn(`[RouteGuard] Access denied to "${pathname}" for role "${user.role}"`);
      router.replace(`/unauthorized?required=privileged&current=${encodeURIComponent(user.role)}&path=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, user, isLoading, authorizedMenus, router]);

  return <>{children}</>;
}
