import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'somity_auth';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'somity_super_secret_key_change_in_production_please'
);

// Public paths that never require auth
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout', '/api/seed', '/_next', '/favicon.ico'];

// ── Unified Role Tier Map (cooperative + legacy) ──────────────────────────────
const ROLE_TIER: Record<string, number> = {
  // Cooperative roles
  'Field Employee':  1,
  'Officer':         3,
  'Treasurer':       5,
  'Secretary':       6,
  'Vice Chairman':   8,
  'Chairman':        10,
  // Legacy roles (backward compatible)
  'Back-Office':          1,
  'Teller':               2,
  'Operations In-Charge': 3,
  'Branch Manager':       4,
  'Super Admin':          10,
};

// ── Middleware-Level Route Permission Rules ───────────────────────────────────
// These are enforced at the Edge (before React renders anything).
// Client-side RouteGuard adds a second layer for URL hijack prevention.
const ROUTE_MIN_TIERS: Array<{ pattern: RegExp; minTier: number; minRole: string }> = [
  // Chairman-only routes
  { pattern: /^\/settings\/users/,        minTier: 10, minRole: 'Chairman' },
  { pattern: /^\/settings\/privileges/,   minTier: 10, minRole: 'Chairman' },
  { pattern: /^\/api\/rbac\/roles/,        minTier: 10, minRole: 'Chairman' },
  { pattern: /^\/api\/rbac\/assign-role/,  minTier: 10, minRole: 'Chairman' },
  { pattern: /^\/api\/seed/,              minTier: 10, minRole: 'Chairman' },

  // Vice Chairman and above
  { pattern: /^\/loans\/disbursement/,    minTier: 8,  minRole: 'Vice Chairman' },
  { pattern: /^\/accounts\/profit-loss/,  minTier: 8,  minRole: 'Vice Chairman' },
  { pattern: /^\/api\/loans\/disbursement/,minTier: 8,  minRole: 'Vice Chairman' },

  // Secretary and above (was Operations In-Charge in legacy)
  { pattern: /^\/approvals/,              minTier: 6,  minRole: 'Secretary' },
  { pattern: /^\/api\/approvals/,         minTier: 6,  minRole: 'Secretary' },
  { pattern: /^\/loans\/approvals/,       minTier: 6,  minRole: 'Secretary' },
  { pattern: /^\/hr\/payroll/,            minTier: 6,  minRole: 'Secretary' },
  { pattern: /^\/hr\/shifts/,             minTier: 6,  minRole: 'Secretary' },
  { pattern: /^\/hr\/duty-roster/,        minTier: 6,  minRole: 'Secretary' },
  { pattern: /^\/api\/hr\/payroll/,       minTier: 6,  minRole: 'Secretary' },
  { pattern: /^\/api\/loans\/approvals/,  minTier: 6,  minRole: 'Secretary' },

  // Treasurer and above — financial reporting
  { pattern: /^\/accounts\/income-statement/, minTier: 5, minRole: 'Treasurer' },

  // Any authenticated user (Field Employee and above)
  { pattern: /^\/dashboard/,  minTier: 1, minRole: 'Field Employee' },
  { pattern: /^\/api\//,      minTier: 1, minRole: 'Field Employee' },
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static assets
  if (pathname.match(/\.(png|jpg|svg|ico|webp|css|js|woff2?)$/)) {
    return NextResponse.next();
  }

  // Get token
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('reason', 'unauthenticated');
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  let payload: Record<string, unknown>;
  try {
    const result = await jwtVerify(token, JWT_SECRET);
    payload = result.payload as Record<string, unknown>;
  } catch {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('reason', 'session_expired');
    loginUrl.searchParams.set('next', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
    return response;
  }

  const userRole = payload.role as string;
  const userTier = ROLE_TIER[userRole] ?? 0;

  // Check route-level permissions (middleware enforcement)
  for (const rule of ROUTE_MIN_TIERS) {
    if (rule.pattern.test(pathname) && userTier < rule.minTier) {
      const unauthorizedUrl = new URL('/unauthorized', req.url);
      unauthorizedUrl.searchParams.set('required', rule.minRole);
      unauthorizedUrl.searchParams.set('current', userRole);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // Redirect root to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Pass user info as headers for server components
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', String(payload.id || ''));
  requestHeaders.set('x-user-role', userRole);
  requestHeaders.set('x-user-branch', String(payload.branch || ''));
  requestHeaders.set('x-user-name', String(payload.name || ''));

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
