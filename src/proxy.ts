import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'somity_auth';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'somity_super_secret_key_change_in_production_please'
);

// Public paths that never require auth
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout', '/_next', '/favicon.ico'];

// Role tier map (mirrored here for Edge compatibility — no Node.js imports)
const ROLE_TIER: Record<string, number> = {
  'Back-Office': 1,
  'Teller': 2,
  'Operations In-Charge': 3,
  'Branch Manager': 4,
  'Super Admin': 5,
};

// Minimal route permission map for middleware-level enforcement
const ROUTE_MIN_TIERS: Array<{ pattern: RegExp; minTier: number; minRole: string }> = [
  { pattern: /^\/settings\/users/, minTier: 5, minRole: 'Super Admin' },
  { pattern: /^\/settings\/privileges/, minTier: 5, minRole: 'Super Admin' },
  { pattern: /^\/api\/seed/, minTier: 5, minRole: 'Super Admin' },
  { pattern: /^\/loans\/disbursement/, minTier: 4, minRole: 'Branch Manager' },
  { pattern: /^\/loans\/approvals/, minTier: 3, minRole: 'Operations In-Charge' },
  { pattern: /^\/hr\/payroll/, minTier: 3, minRole: 'Operations In-Charge' },
  { pattern: /^\/api\/hr\/payroll/, minTier: 3, minRole: 'Operations In-Charge' },
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

  // Check route-level permissions
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
