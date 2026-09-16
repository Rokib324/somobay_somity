import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getSessionUserFromRequest } from '@/lib/auth';
import Approval from '@/models/Approval';
import Member from '@/models/Member';
import WithdrawalRequest from '@/models/WithdrawalRequest';
import DepositAccount from '@/models/DepositAccount';
import Collection from '@/models/Collection';
import LoanAccount from '@/models/LoanAccount';
import Voucher from '@/models/Voucher';

const ALLOWED_ROLES = ['Secretary', 'Vice Chairman', 'Chairman', 'Super Admin'];

// GET /api/approvals/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUserFromRequest(req);
    if (!sessionUser || !ALLOWED_ROLES.includes(sessionUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const approval = await Approval.findById(id).lean();

    if (!approval) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 });
    }

    // Attach full entity record for in-depth drawer inspection
    let entityData: Record<string, any> | null = null;
    if (approval.entityModel === 'Member') {
      entityData = await Member.findById(approval.entityId).lean();
    } else if (approval.entityModel === 'WithdrawalRequest') {
      entityData = await WithdrawalRequest.findById(approval.entityId).lean();
    } else if (approval.entityModel === 'LoanAccount') {
      entityData = await LoanAccount.findById(approval.entityId).lean();
    } else if (approval.entityModel === 'Voucher') {
      entityData = await Voucher.findById(approval.entityId).lean();
    }

    return NextResponse.json({ approval, entityData });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch approval';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/approvals/[id] — Execute approval or rejection at the current stage
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUserFromRequest(req);
    if (!sessionUser || !ALLOWED_ROLES.includes(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only Secretary, Vice Chairman, and Chairman can perform approvals.' },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { action, notes } = body; // action: 'approved' | 'rejected'

    if (!action || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: 'Valid action (approved/rejected) required' }, { status: 400 });
    }

    const approval = await Approval.findById(id);
    if (!approval) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 });
    }

    if (approval.status === 'approved' || approval.status === 'rejected') {
      return NextResponse.json(
        { error: `This request has already been ${approval.status}. No further actions can be taken.` },
        { status: 400 }
      );
    }

    const userRole = sessionUser.role;

    // ── STAGE 1: Secretary Review ───────────────────────────────────────────
    if (approval.currentStage === 'secretary') {
      if (userRole !== 'Secretary') {
        return NextResponse.json(
          { error: 'Stage 1 must be approved or rejected by the Secretary first.' },
          { status: 403 }
        );
      }

      if (action === 'rejected') {
        approval.status = 'rejected';
        approval.rejectionReason = notes || 'Rejected by Secretary';
        approval.rejectedBy = sessionUser.name;
        approval.rejectedByRole = 'Secretary';
        approval.rejectedAt = new Date();
        approval.steps.push({
          stage: 'secretary',
          action: 'rejected',
          actionBy: sessionUser.name,
          actionByRole: 'Secretary',
          actionById: sessionUser.id,
          notes: notes || 'Rejected at initial stage by Secretary',
          actionAt: new Date(),
        });

        // Terminate underlying entity
        await terminateUnderlyingEntity(approval, notes || 'Rejected by Secretary');
        await approval.save();

        return NextResponse.json({
          success: true,
          message: 'Request rejected by Secretary. Workflow terminated.',
          approval,
        });
      }

      // Action is 'approved' by Secretary -> Advance to Vice Chairman
      approval.currentStage = 'vice_chairman';
      approval.steps.push({
        stage: 'secretary',
        action: 'approved',
        actionBy: sessionUser.name,
        actionByRole: 'Secretary',
        actionById: sessionUser.id,
        notes: notes || 'Verified and approved by Secretary',
        actionAt: new Date(),
      });

      await approval.save();

      return NextResponse.json({
        success: true,
        message: 'Approved by Secretary. Successfully passed to Vice Chairman for authorization.',
        approval,
      });
    }

    // ── STAGE 2: Vice Chairman Authorization ────────────────────────────────
    if (approval.currentStage === 'vice_chairman') {
      if (userRole !== 'Vice Chairman') {
        return NextResponse.json(
          { error: 'Stage 2 must be approved or rejected by the Vice Chairman.' },
          { status: 403 }
        );
      }

      if (action === 'rejected') {
        approval.status = 'rejected';
        approval.rejectionReason = notes || 'Rejected by Vice Chairman';
        approval.rejectedBy = sessionUser.name;
        approval.rejectedByRole = 'Vice Chairman';
        approval.rejectedAt = new Date();
        approval.steps.push({
          stage: 'vice_chairman',
          action: 'rejected',
          actionBy: sessionUser.name,
          actionByRole: 'Vice Chairman',
          actionById: sessionUser.id,
          notes: notes || 'Rejected by Vice Chairman',
          actionAt: new Date(),
        });

        // Terminate underlying entity
        await terminateUnderlyingEntity(approval, notes || 'Rejected by Vice Chairman');
        await approval.save();

        return NextResponse.json({
          success: true,
          message: 'Request rejected by Vice Chairman. Workflow terminated.',
          approval,
        });
      }

      // Action is 'approved' by Vice Chairman -> Advance to Chairman
      approval.currentStage = 'chairman';
      approval.steps.push({
        stage: 'vice_chairman',
        action: 'approved',
        actionBy: sessionUser.name,
        actionByRole: 'Vice Chairman',
        actionById: sessionUser.id,
        notes: notes || 'Operational clearance granted by Vice Chairman',
        actionAt: new Date(),
      });

      await approval.save();

      return NextResponse.json({
        success: true,
        message: 'Approved by Vice Chairman. Successfully passed to Chairman for final sanction.',
        approval,
      });
    }

    // ── STAGE 3: Chairman Final Sanction ────────────────────────────────────
    if (approval.currentStage === 'chairman') {
      if (userRole !== 'Chairman' && userRole !== 'Super Admin') {
        return NextResponse.json(
          { error: 'Stage 3 must be approved or rejected by the Chairman.' },
          { status: 403 }
        );
      }

      if (action === 'rejected') {
        approval.status = 'rejected';
        approval.rejectionReason = notes || 'Rejected by Chairman';
        approval.rejectedBy = sessionUser.name;
        approval.rejectedByRole = 'Chairman';
        approval.rejectedAt = new Date();
        approval.steps.push({
          stage: 'chairman',
          action: 'rejected',
          actionBy: sessionUser.name,
          actionByRole: 'Chairman',
          actionById: sessionUser.id,
          notes: notes || 'Final sanction rejected by Chairman',
          actionAt: new Date(),
        });

        await terminateUnderlyingEntity(approval, notes || 'Rejected by Chairman');
        await approval.save();

        return NextResponse.json({
          success: true,
          message: 'Request rejected by Chairman.',
          approval,
        });
      }

      // Action is 'approved' by Chairman -> Fully Approved & Executed!
      approval.status = 'approved';
      approval.currentStage = 'completed';
      approval.finalApprovedBy = sessionUser.name;
      approval.finalApprovedAt = new Date();
      approval.steps.push({
        stage: 'chairman',
        action: 'approved',
        actionBy: sessionUser.name,
        actionByRole: 'Chairman',
        actionById: sessionUser.id,
        notes: notes || 'Final sanction and execution granted by Chairman',
        actionAt: new Date(),
      });

      // Execute final domain side-effects
      await executeFinalApprovalEffects(approval, sessionUser.name);
      await approval.save();

      return NextResponse.json({
        success: true,
        message: 'Final approval granted by Chairman. All actions executed successfully!',
        approval,
      });
    }

    return NextResponse.json(
      { error: `Invalid workflow stage: ${approval.currentStage}` },
      { status: 400 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to process approval action';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Helper to update underlying entities on rejection
async function terminateUnderlyingEntity(approval: any, reason: string) {
  try {
    if (approval.type === 'member') {
      await Member.findByIdAndUpdate(approval.entityId, { status: 'inactive' });
    } else if (approval.type === 'withdrawal') {
      await WithdrawalRequest.findByIdAndUpdate(approval.entityId, {
        status: 'Rejected',
        rejectionReason: reason,
      });
    } else if (approval.type === 'loan') {
      await LoanAccount.findByIdAndUpdate(approval.entityId, { status: 'rejected' });
    } else if (approval.type === 'voucher') {
      await Voucher.findByIdAndUpdate(approval.entityId, { status: 'cancelled' });
    }
  } catch (err) {
    console.error('Error terminating underlying entity:', err);
  }
}

// Helper to execute final domain actions upon Chairman's approval
async function executeFinalApprovalEffects(approval: any, approvedByName: string) {
  try {
    if (approval.type === 'member') {
      // Activate Member
      await Member.findByIdAndUpdate(approval.entityId, { status: 'active' });
    } else if (approval.type === 'withdrawal') {
      // Execute Withdrawal: deduct balance and record Collection
      const request = await WithdrawalRequest.findById(approval.entityId);
      if (request && request.status !== 'Approved') {
        const account = await DepositAccount.findById(request.accountId);
        if (account && account.balance >= request.amount) {
          account.balance -= request.amount;
          account.transactions = account.transactions || [];
          account.transactions.push({
            date: new Date(),
            type: 'withdrawal',
            amount: request.amount,
            balance: account.balance,
            reference: request.requestNo,
            notes: `Executive approved withdrawal: ${request.reason}`,
            collectedBy: approvedByName,
          });
          await account.save();

          const member = await Member.findById(request.memberId);
          if (member) {
            member.totalDeposit = Math.max(0, (member.totalDeposit || 0) - request.amount);
            await member.save();
          }

          await Collection.create({
            date: new Date(),
            memberId: request.memberId,
            memberName: request.memberName,
            accountNo: request.accountNo,
            branch: request.branch,
            type: 'withdrawal',
            accountId: request.accountId,
            amount: request.amount,
            collectedBy: approvedByName,
            reference: request.requestNo,
            notes: request.reason,
          });

          request.status = 'Approved';
          request.approvedBy = approvedByName;
          request.approvalDate = new Date();
          await request.save();
        }
      }
    } else if (approval.type === 'loan') {
      // Approve Loan (ready for disbursement)
      await LoanAccount.findByIdAndUpdate(approval.entityId, {
        status: 'approved',
        approvedBy: approvedByName,
      });
    } else if (approval.type === 'voucher' || approval.type === 'transaction') {
      // Post Voucher
      await Voucher.findByIdAndUpdate(approval.entityId, {
        status: 'posted',
        approvedBy: approvedByName,
      });
    }
  } catch (err) {
    console.error('Error executing final approval effects:', err);
  }
}
