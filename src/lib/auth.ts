/**
 * auth.ts — SERVER-ONLY auth utilities.
 * Uses next/headers and next/server. Do NOT import in Client Components.
 * Client Components should import from '@/lib/auth-shared'.
 */
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { UserRole } from '@/models/User';
import {
  COOKIE_NAME,
  ROLE_TIER,
  type SessionUser,
} from './auth-shared';

// Re-export everything from auth-shared for server-side consumers
export * from './auth-shared';

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'somity_super_secret_key_change_in_production_please'
);
export const SESSION_DURATION = '8h';

/** Sign a JWT token with session payload */
export async function signToken(payload: SessionUser): Promise<string> {
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  return new SignJWT(cleanPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(JWT_SECRET);
}

/** Verify a JWT token and return the payload */
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

/** Read the session user from the auth cookie (Server Component / Route Handler) */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

/** Read the session user from a NextRequest (Middleware / API Routes) */
export async function getSessionUserFromRequest(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Set the auth cookie on a response */
export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60,
    path: '/',
  });
  return response;
}

/** Clear the auth cookie */
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return response;
}

/** Assert that the request has a valid session and meets minimum role tier. */
export async function requireRole(
  req: NextRequest,
  minRole: UserRole
): Promise<SessionUser> {
  const user = await getSessionUserFromRequest(req);

  if (!user) {
    throw NextResponse.json({ error: 'Unauthorized — please log in.' }, { status: 401 });
  }

  const userTier = ROLE_TIER[user.role] ?? 0;
  const requiredTier = ROLE_TIER[minRole] ?? 99;

  if (userTier < requiredTier) {
    throw NextResponse.json(
      {
        error: `Access denied. Required: ${minRole} (Tier ${requiredTier}). Your role: ${user.role} (Tier ${userTier}).`,
        required: minRole,
        current: user.role,
      },
      { status: 403 }
    );
  }

  return user;
}
