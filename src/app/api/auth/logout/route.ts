import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest, clearAuthCookie } from '@/lib/auth';
import AuditLog from '@/models/AuditLog';
import connectDB from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getSessionUserFromRequest(req);

    if (user) {
      await AuditLog.create({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: 'LOGOUT',
        outcome: 'success',
        details: 'User logged out',
        ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        branch: user.branch,
      });
    }

    const response = NextResponse.json({ success: true });
    return clearAuthCookie(response);
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json({ success: true });
    return clearAuthCookie(response);
  }
}
