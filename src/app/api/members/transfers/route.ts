import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MemberTransfer from '@/models/MemberTransfer';
import DepositAccount from '@/models/DepositAccount';
import Member from '@/models/Member';

export async function GET() {
  try {
    await connectDB();
    const transfers = await MemberTransfer.find().sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json({ transfers });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { transferType, sourceAccountNo, targetMemberId, targetAccountNo, amount, reason } = body;

    if (!transferType || !sourceAccountNo || !reason) {
      return NextResponse.json({ error: 'Missing required transfer details' }, { status: 400 });
    }

    const sourceAccount = await DepositAccount.findOne({ accountNo: sourceAccountNo });
    if (!sourceAccount) {
      return NextResponse.json({ error: 'Source account not found' }, { status: 404 });
    }

    const sourceMember = await Member.findById(sourceAccount.memberId);
    if (!sourceMember) {
      return NextResponse.json({ error: 'Source member not found' }, { status: 404 });
    }

    if (transferType === 'Amount Transfer') {
      const transferAmount = Number(amount);
      if (isNaN(transferAmount) || transferAmount <= 0) {
        return NextResponse.json({ error: 'Transfer amount must be greater than 0' }, { status: 400 });
      }

      if (sourceAccount.balance < transferAmount) {
        return NextResponse.json(
          { error: `Insufficient funds. Available balance: ৳ ${sourceAccount.balance.toLocaleString()}` },
          { status: 400 }
        );
      }

      const targetAccount = await DepositAccount.findOne({ accountNo: targetAccountNo });
      if (!targetAccount) {
        return NextResponse.json({ error: 'Destination account not found' }, { status: 404 });
      }

      const targetMember = await Member.findById(targetAccount.memberId);
      if (!targetMember) {
        return NextResponse.json({ error: 'Target member not found' }, { status: 404 });
      }

      // 1. Deduct from source
      sourceAccount.balance -= transferAmount;
      sourceAccount.transactions.push({
        date: new Date(),
        type: 'withdrawal',
        amount: transferAmount,
        balance: sourceAccount.balance,
        reference: `Transfer to ${targetAccount.accountNo}`,
        notes: reason,
      });
      await sourceAccount.save();

      // Update source member totalDeposit
      sourceMember.totalDeposit = Math.max(0, (sourceMember.totalDeposit || 0) - transferAmount);
      await sourceMember.save();

      // 2. Credit to target
      targetAccount.balance += transferAmount;
      targetAccount.transactions.push({
        date: new Date(),
        type: 'deposit',
        amount: transferAmount,
        balance: targetAccount.balance,
        reference: `Transfer from ${sourceAccount.accountNo}`,
        notes: reason,
      });
      await targetAccount.save();

      // Update target member totalDeposit
      targetMember.totalDeposit = (targetMember.totalDeposit || 0) + transferAmount;
      await targetMember.save();

      // 3. Create log
      const log = await MemberTransfer.create({
        transferType: 'Amount Transfer',
        sourceMemberId: sourceMember._id,
        sourceMemberName: sourceMember.name,
        sourceAccountNo: sourceAccount.accountNo,
        targetMemberId: targetMember._id,
        targetMemberName: targetMember.name,
        targetAccountNo: targetAccount.accountNo,
        amount: transferAmount,
        reason,
        status: 'Completed',
      });

      return NextResponse.json({ success: true, transfer: log }, { status: 201 });
    }

    if (transferType === 'Account Ownership Transfer') {
      const targetMember = await Member.findById(targetMemberId);
      if (!targetMember) {
        return NextResponse.json({ error: 'Target member not found' }, { status: 404 });
      }

      const accountBalance = sourceAccount.balance;

      // Transfer ownership
      sourceAccount.memberId = targetMember._id as any;
      sourceAccount.memberName = targetMember.name;
      sourceAccount.transactions.push({
        date: new Date(),
        type: 'interest',
        amount: 0,
        balance: accountBalance,
        reference: `Ownership transferred from ${sourceMember.name} to ${targetMember.name}`,
        notes: reason,
      });
      await sourceAccount.save();

      // Adjust total deposits
      sourceMember.totalDeposit = Math.max(0, (sourceMember.totalDeposit || 0) - accountBalance);
      await sourceMember.save();

      targetMember.totalDeposit = (targetMember.totalDeposit || 0) + accountBalance;
      await targetMember.save();

      const log = await MemberTransfer.create({
        transferType: 'Account Ownership Transfer',
        sourceMemberId: sourceMember._id,
        sourceMemberName: sourceMember.name,
        sourceAccountNo: sourceAccount.accountNo,
        targetMemberId: targetMember._id,
        targetMemberName: targetMember.name,
        amount: accountBalance,
        reason,
        status: 'Completed',
      });

      return NextResponse.json({ success: true, transfer: log }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid transfer type specified' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to process transfer';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
