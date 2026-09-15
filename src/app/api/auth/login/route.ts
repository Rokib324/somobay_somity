import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import {
  signToken,
  setAuthCookie,
  LOCK_DURATION_MINUTES,
  MAX_FAILED_ATTEMPTS,
  type SessionUser,
} from '@/lib/auth';

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password, branch } = body as {
      email?: string;
      password?: string;
      branch?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Find user (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      await AuditLog.create({
        userEmail: email,
        action: 'LOGIN_FAILED',
        outcome: 'failure',
        details: 'User not found',
        ip,
        userAgent,
      });
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Check account status
    if (user.status === 'Inactive') {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Contact your administrator.' },
        { status: 403 }
      );
    }

    // Check if account is locked
    if (user.status === 'Locked' || (user.lockedUntil && user.lockedUntil > new Date())) {
      const unlockTime = user.lockedUntil
        ? Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)
        : LOCK_DURATION_MINUTES;
      await AuditLog.create({
        userId: String(user._id),
        userEmail: user.email,
        userRole: user.role,
        action: 'LOGIN_BLOCKED',
        outcome: 'blocked',
        details: `Account locked. Retry in ${unlockTime} minutes.`,
        ip,
        userAgent,
        branch: user.branch,
      });
      return NextResponse.json(
        {
          error: `Account is temporarily locked due to multiple failed attempts. Try again in ${unlockTime} minute(s).`,
          locked: true,
          unlockMinutes: unlockTime,
        },
        { status: 423 }
      );
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        const unlockAt = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
        user.status = 'Locked';
        user.lockedUntil = unlockAt;
      }

      await user.save({ validateModifiedOnly: true });

      const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - user.failedLoginAttempts);

      await AuditLog.create({
        userId: String(user._id),
        userEmail: user.email,
        userRole: user.role,
        action: 'LOGIN_FAILED',
        outcome: 'failure',
        details: `Wrong password. Attempts: ${user.failedLoginAttempts}/${MAX_FAILED_ATTEMPTS}`,
        ip,
        userAgent,
        branch: user.branch,
      });

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        return NextResponse.json(
          {
            error: `Account locked for ${LOCK_DURATION_MINUTES} minutes due to too many failed attempts.`,
            locked: true,
            unlockMinutes: LOCK_DURATION_MINUTES,
          },
          { status: 423 }
        );
      }

      return NextResponse.json(
        {
          error: `Invalid credentials. ${remaining} attempt(s) remaining before lockout.`,
          attemptsRemaining: remaining,
        },
        { status: 401 }
      );
    }

    // Branch check (optional — if branch is provided, verify it matches)
    if (branch && user.role !== 'Super Admin' && user.branch !== branch) {
      await AuditLog.create({
        userId: String(user._id),
        userEmail: user.email,
        userRole: user.role,
        action: 'LOGIN_FAILED',
        outcome: 'failure',
        details: `Branch mismatch. Attempted: ${branch}, Actual: ${user.branch}`,
        ip,
        userAgent,
        branch: user.branch,
      });
      return NextResponse.json(
        { error: 'You are not registered with this branch. Please select the correct branch.' },
        { status: 403 }
      );
    }

    // Success — reset failed attempts, update last login
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.status = 'Active';
    user.lastLogin = new Date();
    await user.save({ validateModifiedOnly: true });

    const sessionUser: SessionUser = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      transactionLimit: user.transactionLimit,
      permissions: Array.from(user.permissions || []),
      menuPrivileges: Array.from(user.menuPrivileges || []),
      mustChangePassword: Boolean(user.mustChangePassword),
    };

    const token = await signToken(sessionUser);

    await AuditLog.create({
      userId: sessionUser.id,
      userEmail: sessionUser.email,
      userRole: sessionUser.role,
      action: 'LOGIN',
      outcome: 'success',
      details: `Logged in from branch: ${sessionUser.branch}`,
      ip,
      userAgent,
      branch: sessionUser.branch,
    });

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      mustChangePassword: user.mustChangePassword,
    });

    return setAuthCookie(response, token);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
