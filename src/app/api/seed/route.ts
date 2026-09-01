import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Branch from '@/models/Branch';
import User from '@/models/User';
import Member from '@/models/Member';
import DepositAccount from '@/models/DepositAccount';
import LoanProduct from '@/models/LoanProduct';
import LoanAccount from '@/models/LoanAccount';
import Collection from '@/models/Collection';
import AccountHead from '@/models/AccountHead';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';
import Leave from '@/models/Leave';
import SMS from '@/models/SMS';

export async function POST() {
  try {
    await connectDB();

    // Check if already seeded
    const memberCount = await Member.countDocuments();
    if (memberCount > 0) {
      return NextResponse.json({ message: 'Database already seeded', count: memberCount });
    }

    // 1. Seed Branches
    const branches = await Branch.insertMany([
      { code: 'HO', name: 'Head Office (Dhaka)', manager: 'Mohammad Kamal', phone: '01700000001', address: 'Motijheel, Dhaka-1000', status: 'active', totalMembers: 0 },
      { code: 'UTT', name: 'Uttara Branch', manager: 'Nasim Ahmed', phone: '01700000002', address: 'Sector-7, Uttara, Dhaka', status: 'active', totalMembers: 0 },
      { code: 'GUL', name: 'Gulshan Branch', manager: 'Farida Begum', phone: '01700000003', address: 'Gulshan-2, Dhaka-1212', status: 'active', totalMembers: 0 },
      { code: 'MIR', name: 'Mirpur Branch', manager: 'Rezaul Karim', phone: '01700000004', address: 'Mirpur-10, Dhaka', status: 'active', totalMembers: 0 },
    ]);

    // 2. Seed Users
    await User.insertMany([
      { name: 'Super Admin', email: 'admin@somity.com', password: 'hashed_password', role: 'Super Admin', branch: 'Head Office (Dhaka)', status: 'Active' },
      { name: 'Nasim Ahmed', email: 'nasim@somity.com', password: 'hashed_password', role: 'Branch Manager', branch: 'Uttara Branch', status: 'Active' },
      { name: 'Rania Khatun', email: 'rania@somity.com', password: 'hashed_password', role: 'Accountant', branch: 'Head Office (Dhaka)', status: 'Active' },
      { name: 'Sohel Rana', email: 'sohel@somity.com', password: 'hashed_password', role: 'Field Officer', branch: 'Mirpur Branch', status: 'Active' },
    ]);

    // 3. Seed Members
    const members = await Member.insertMany([
      { accountNo: 'AC-1001', name: 'Md. Al-Amin Khan', fatherName: 'Late Rafiqul Islam', motherName: 'Razia Begum', mobile: '01712345678', nid: '1992837492817', category: 'General Member', branch: 'Head Office (Dhaka)', joinDate: new Date('2022-01-15'), address: 'Mirpur-10, Dhaka', status: 'active', totalDeposit: 145000, totalLoan: 50000 },
      { accountNo: 'AC-1002', name: 'Nasrin Akhter', fatherName: 'Anwar Hossain', motherName: 'Fatema Khatun', mobile: '01898765432', nid: '1987654321098', category: 'Micro Business', branch: 'Uttara Branch', joinDate: new Date('2022-03-20'), address: 'Sector-7, Uttara, Dhaka', status: 'active', totalDeposit: 89000, totalLoan: 120000 },
      { accountNo: 'AC-1003', name: 'Habibur Rahman', fatherName: 'Motiur Rahman', motherName: 'Rokeya Begum', mobile: '01911223344', nid: '1976543210987', category: 'General Member', branch: 'Head Office (Dhaka)', joinDate: new Date('2021-11-10'), address: 'Dhanmondi, Dhaka', status: 'active', totalDeposit: 230000, totalLoan: 0 },
      { accountNo: 'AC-1004', name: 'Sharmin Sultana', fatherName: 'Shahjahan Miah', motherName: 'Laila Arjumand', mobile: '01655443322', nid: '1995123456789', category: 'VIP Member', branch: 'Gulshan Branch', joinDate: new Date('2023-02-01'), address: 'Gulshan-2, Dhaka', status: 'active', totalDeposit: 550000, totalLoan: 200000 },
      { accountNo: 'AC-1005', name: 'Kamrul Hasan', fatherName: 'Abdul Jalil', motherName: 'Jamila Khatun', mobile: '01511889900', nid: '1984567890123', category: 'Micro Business', branch: 'Uttara Branch', joinDate: new Date('2023-06-15'), address: 'Uttara Sector 11, Dhaka', status: 'pending', totalDeposit: 15000, totalLoan: 0 },
      { accountNo: 'AC-1006', name: 'Rina Parvin', fatherName: 'Abdur Rahman', motherName: 'Sufia Begum', mobile: '01712987654', nid: '1988345678901', category: 'General Member', branch: 'Mirpur Branch', joinDate: new Date('2022-07-10'), address: 'Mirpur-1, Dhaka', status: 'active', totalDeposit: 67000, totalLoan: 30000 },
      { accountNo: 'AC-1007', name: 'Monjurul Islam', fatherName: 'Sirajul Islam', motherName: 'Rabeya Khatun', mobile: '01923456789', nid: '1990123456780', category: 'VIP Member', branch: 'Head Office (Dhaka)', joinDate: new Date('2021-05-20'), address: 'Banani, Dhaka', status: 'active', totalDeposit: 890000, totalLoan: 300000 },
      { accountNo: 'AC-1008', name: 'Shahanaz Begum', fatherName: 'Nuruzzaman', motherName: 'Hosneara Begum', mobile: '01611234567', nid: '1982876543210', category: 'General Member', branch: 'Gulshan Branch', joinDate: new Date('2023-09-01'), address: 'Baridhara, Dhaka', status: 'active', totalDeposit: 45000, totalLoan: 0 },
    ]);

    // 4. Seed Deposit Accounts
    await DepositAccount.insertMany([
      { accountNo: 'DEP-101', memberId: members[0]._id, memberName: members[0].name, type: 'Daily Savings', amount: 500, interestRate: 7.5, openingDate: new Date('2022-01-16'), status: 'active', balance: 45000, branch: 'Head Office (Dhaka)' },
      { accountNo: 'DEP-102', memberId: members[1]._id, memberName: members[1].name, type: 'Monthly DPS', amount: 2000, interestRate: 9.0, termMonths: 36, openingDate: new Date('2022-03-21'), maturityDate: new Date('2025-03-21'), status: 'active', balance: 72000, branch: 'Uttara Branch' },
      { accountNo: 'DEP-103', memberId: members[2]._id, memberName: members[2].name, type: 'Fixed Deposit (FDR)', amount: 200000, interestRate: 11.5, termMonths: 24, openingDate: new Date('2022-01-01'), maturityDate: new Date('2024-01-01'), status: 'active', balance: 200000, branch: 'Head Office (Dhaka)' },
      { accountNo: 'DEP-104', memberId: members[3]._id, memberName: members[3].name, type: 'Share Capital', amount: 5000, interestRate: 12.0, openingDate: new Date('2023-02-02'), status: 'active', balance: 50000, branch: 'Gulshan Branch' },
      { accountNo: 'DEP-105', memberId: members[4]._id, memberName: members[4].name, type: 'Daily Savings', amount: 300, interestRate: 7.5, openingDate: new Date('2023-06-16'), status: 'active', balance: 15000, branch: 'Uttara Branch' },
      { accountNo: 'DEP-106', memberId: members[5]._id, memberName: members[5].name, type: 'Daily Savings', amount: 500, interestRate: 7.5, openingDate: new Date('2022-07-11'), status: 'active', balance: 67000, branch: 'Mirpur Branch' },
      { accountNo: 'DEP-107', memberId: members[6]._id, memberName: members[6].name, type: 'Fixed Deposit (FDR)', amount: 500000, interestRate: 11.5, termMonths: 36, openingDate: new Date('2021-06-01'), maturityDate: new Date('2024-06-01'), status: 'active', balance: 500000, branch: 'Head Office (Dhaka)' },
    ]);

    // 5. Seed Loan Products
    const loanProducts = await LoanProduct.insertMany([
      { name: 'General Loan', code: 'GL', interestRate: 12.0, interestType: 'flat', minAmount: 5000, maxAmount: 200000, minTermMonths: 6, maxTermMonths: 36, installmentType: 'Monthly', processingFeePercent: 1.0 },
      { name: 'Micro Business Loan', code: 'MBL', interestRate: 10.0, interestType: 'declining', minAmount: 10000, maxAmount: 500000, minTermMonths: 12, maxTermMonths: 60, installmentType: 'Monthly', processingFeePercent: 0.5 },
      { name: 'Emergency Loan', code: 'EML', interestRate: 8.0, interestType: 'flat', minAmount: 2000, maxAmount: 50000, minTermMonths: 3, maxTermMonths: 12, installmentType: 'Monthly', processingFeePercent: 0 },
      { name: 'Agricultural Loan', code: 'AGL', interestRate: 9.0, interestType: 'flat', minAmount: 10000, maxAmount: 300000, minTermMonths: 6, maxTermMonths: 24, installmentType: 'Monthly', processingFeePercent: 0.5 },
    ]);

    // 6. Seed Loan Accounts
    const today = new Date();
    await LoanAccount.insertMany([
      {
        loanNo: 'LN-2024-001', memberId: members[0]._id, memberName: members[0].name,
        productId: loanProducts[0]._id, productName: 'General Loan',
        principalAmount: 50000, interestRate: 12.0, interestAmount: 9000, totalAmount: 59000,
        paidAmount: 29500, dueAmount: 29500, installments: 12, installmentAmount: 4917,
        installmentType: 'Monthly', applicationDate: new Date('2024-01-10'),
        disbursementDate: new Date('2024-01-15'), status: 'active', branch: 'Head Office (Dhaka)',
        purpose: 'Home renovation', schedule: [],
      },
      {
        loanNo: 'LN-2024-002', memberId: members[1]._id, memberName: members[1].name,
        productId: loanProducts[1]._id, productName: 'Micro Business Loan',
        principalAmount: 120000, interestRate: 10.0, interestAmount: 36000, totalAmount: 156000,
        paidAmount: 78000, dueAmount: 78000, installments: 24, installmentAmount: 6500,
        installmentType: 'Monthly', applicationDate: new Date('2023-06-01'),
        disbursementDate: new Date('2023-06-10'), status: 'active', branch: 'Uttara Branch',
        purpose: 'Tailoring shop expansion', schedule: [],
      },
      {
        loanNo: 'LN-2024-003', memberId: members[3]._id, memberName: members[3].name,
        productId: loanProducts[1]._id, productName: 'Micro Business Loan',
        principalAmount: 200000, interestRate: 10.0, interestAmount: 60000, totalAmount: 260000,
        paidAmount: 52000, dueAmount: 208000, installments: 24, installmentAmount: 10833,
        installmentType: 'Monthly', applicationDate: new Date('2024-03-01'),
        disbursementDate: new Date('2024-03-05'), status: 'active', branch: 'Gulshan Branch',
        purpose: 'Fashion boutique expansion', schedule: [],
      },
      {
        loanNo: 'LN-2024-004', memberId: members[5]._id, memberName: members[5].name,
        productId: loanProducts[0]._id, productName: 'General Loan',
        principalAmount: 30000, interestRate: 12.0, interestAmount: 3600, totalAmount: 33600,
        paidAmount: 0, dueAmount: 33600, installments: 12, installmentAmount: 2800,
        installmentType: 'Monthly', applicationDate: new Date(), status: 'pending_approval',
        branch: 'Mirpur Branch', purpose: 'Medical expenses', schedule: [],
      },
    ]);

    // 7. Seed Collections
    const collectionDates = [-5, -4, -3, -2, -1, 0].map(d => {
      const date = new Date();
      date.setDate(date.getDate() + d);
      return date;
    });
    await Collection.insertMany([
      { date: collectionDates[5], memberId: members[0]._id, memberName: members[0].name, accountNo: 'AC-1001', branch: 'Head Office (Dhaka)', type: 'savings', amount: 500, collectedBy: 'Sohel Rana' },
      { date: collectionDates[5], memberId: members[1]._id, memberName: members[1].name, accountNo: 'AC-1002', branch: 'Uttara Branch', type: 'loan_installment', amount: 6500, collectedBy: 'Nasim Ahmed' },
      { date: collectionDates[4], memberId: members[2]._id, memberName: members[2].name, accountNo: 'AC-1003', branch: 'Head Office (Dhaka)', type: 'savings', amount: 500, collectedBy: 'Sohel Rana' },
      { date: collectionDates[3], memberId: members[3]._id, memberName: members[3].name, accountNo: 'AC-1004', branch: 'Gulshan Branch', type: 'loan_installment', amount: 10833, collectedBy: 'Rania Khatun' },
      { date: collectionDates[2], memberId: members[4]._id, memberName: members[4].name, accountNo: 'AC-1005', branch: 'Uttara Branch', type: 'savings', amount: 300, collectedBy: 'Nasim Ahmed' },
      { date: collectionDates[1], memberId: members[5]._id, memberName: members[5].name, accountNo: 'AC-1006', branch: 'Mirpur Branch', type: 'savings', amount: 500, collectedBy: 'Sohel Rana' },
      { date: collectionDates[0], memberId: members[0]._id, memberName: members[0].name, accountNo: 'AC-1001', branch: 'Head Office (Dhaka)', type: 'loan_installment', amount: 4917, collectedBy: 'Sohel Rana' },
    ]);

    // 8. Seed Chart of Accounts
    await AccountHead.insertMany([
      { code: '1000', name: 'Assets', group: 'Asset', type: 'control', balance: 0 },
      { code: '1100', name: 'Cash & Bank', group: 'Asset', type: 'control', parentCode: '1000', balance: 1250000 },
      { code: '1101', name: 'Cash in Hand', group: 'Asset', type: 'detail', parentCode: '1100', balance: 150000 },
      { code: '1102', name: 'Bank Account - Dhaka Bank', group: 'Asset', type: 'detail', parentCode: '1100', balance: 1100000 },
      { code: '1200', name: 'Loans Receivable', group: 'Asset', type: 'control', parentCode: '1000', balance: 700000 },
      { code: '1201', name: 'General Loans Outstanding', group: 'Asset', type: 'detail', parentCode: '1200', balance: 400000 },
      { code: '1202', name: 'Micro Business Loans Outstanding', group: 'Asset', type: 'detail', parentCode: '1200', balance: 300000 },
      { code: '2000', name: 'Liabilities', group: 'Liability', type: 'control', balance: 0 },
      { code: '2100', name: 'Members Deposits', group: 'Liability', type: 'control', parentCode: '2000', balance: 1050000 },
      { code: '2101', name: 'Daily Savings Deposits', group: 'Liability', type: 'detail', parentCode: '2100', balance: 350000 },
      { code: '2102', name: 'Monthly DPS Deposits', group: 'Liability', type: 'detail', parentCode: '2100', balance: 300000 },
      { code: '2103', name: 'Fixed Deposit (FDR)', group: 'Liability', type: 'detail', parentCode: '2100', balance: 400000 },
      { code: '3000', name: 'Equity', group: 'Equity', type: 'control', balance: 0 },
      { code: '3100', name: 'Share Capital', group: 'Equity', type: 'detail', parentCode: '3000', balance: 500000 },
      { code: '3200', name: 'Retained Earnings', group: 'Equity', type: 'detail', parentCode: '3000', balance: 200000 },
      { code: '4000', name: 'Income', group: 'Income', type: 'control', balance: 0 },
      { code: '4100', name: 'Loan Interest Income', group: 'Income', type: 'detail', parentCode: '4000', balance: 108000 },
      { code: '4200', name: 'Processing Fee Income', group: 'Income', type: 'detail', parentCode: '4000', balance: 8500 },
      { code: '4300', name: 'Membership Fee Income', group: 'Income', type: 'detail', parentCode: '4000', balance: 15000 },
      { code: '5000', name: 'Expenses', group: 'Expense', type: 'control', balance: 0 },
      { code: '5100', name: 'Salary & Allowances', group: 'Expense', type: 'detail', parentCode: '5000', balance: 280000 },
      { code: '5200', name: 'Rent & Utilities', group: 'Expense', type: 'detail', parentCode: '5000', balance: 60000 },
      { code: '5300', name: 'Interest Expense on Deposits', group: 'Expense', type: 'detail', parentCode: '5000', balance: 95000 },
      { code: '5400', name: 'Office & Administrative', group: 'Expense', type: 'detail', parentCode: '5000', balance: 25000 },
    ]);

    // 9. Seed Employees
    const employees = await Employee.insertMany([
      { empId: 'EMP-001', name: 'Mohammad Kamal', designation: 'General Manager', department: 'Management', phone: '01711111111', email: 'kamal@somity.com', joinDate: new Date('2019-01-01'), salary: 65000, branch: 'Head Office (Dhaka)', status: 'active' },
      { empId: 'EMP-002', name: 'Rania Khatun', designation: 'Senior Accountant', department: 'Accounts', phone: '01722222222', email: 'rania@somity.com', joinDate: new Date('2020-03-15'), salary: 40000, branch: 'Head Office (Dhaka)', status: 'active' },
      { empId: 'EMP-003', name: 'Sohel Rana', designation: 'Field Officer', department: 'Operations', phone: '01733333333', email: 'sohel@somity.com', joinDate: new Date('2021-06-01'), salary: 25000, branch: 'Mirpur Branch', status: 'active' },
      { empId: 'EMP-004', name: 'Nasim Ahmed', designation: 'Branch Manager', department: 'Management', phone: '01744444444', email: 'nasim@somity.com', joinDate: new Date('2020-08-01'), salary: 50000, branch: 'Uttara Branch', status: 'active' },
      { empId: 'EMP-005', name: 'Farida Begum', designation: 'Branch Manager', department: 'Management', phone: '01755555555', email: 'farida@somity.com', joinDate: new Date('2021-01-10'), salary: 50000, branch: 'Gulshan Branch', status: 'active' },
    ]);

    // 10. Seed Attendance for today
    await Attendance.insertMany(
      employees.map(emp => ({
        empId: emp._id,
        empCode: emp.empId,
        empName: emp.name,
        date: new Date(),
        checkIn: '09:05',
        checkOut: '17:00',
        status: 'Present',
        workHours: 7.9,
        branch: emp.branch,
      }))
    );

    // 11. Seed SMS
    await SMS.insertMany([
      { recipient: 'Md. Al-Amin Khan', phone: '01712345678', message: 'Dear member, your savings deposit of BDT 500 has been received. Balance: 45000. -Somobay Somity', type: 'Transaction', status: 'Delivered', sentAt: new Date() },
      { recipient: 'Nasrin Akhter', phone: '01898765432', message: 'Dear member, your loan installment of BDT 6500 has been collected. Remaining: 78000. -Somobay Somity', type: 'Transaction', status: 'Delivered', sentAt: new Date() },
      { recipient: 'All Members', phone: 'BULK', message: 'Dear members, our branch will remain closed on Friday 30th August for Eid holiday. Thank you. -Somobay Somity', type: 'Bulk', status: 'Delivered', sentAt: new Date() },
    ]);

    // Update branch member counts
    await Branch.findOneAndUpdate({ name: 'Head Office (Dhaka)' }, { totalMembers: 3 });
    await Branch.findOneAndUpdate({ name: 'Uttara Branch' }, { totalMembers: 2 });
    await Branch.findOneAndUpdate({ name: 'Gulshan Branch' }, { totalMembers: 2 });
    await Branch.findOneAndUpdate({ name: 'Mirpur Branch' }, { totalMembers: 1 });

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with realistic cooperative data!',
      data: {
        branches: 4,
        users: 4,
        members: members.length,
        depositAccounts: 7,
        loanProducts: loanProducts.length,
        loans: 4,
        employees: employees.length,
        collections: 7,
        accountHeads: 24,
        smsRecords: 3,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seeding failed', details: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const counts = {
      members: await Member.countDocuments(),
      deposits: await DepositAccount.countDocuments(),
      loans: await LoanAccount.countDocuments(),
      employees: await Employee.countDocuments(),
      branches: await Branch.countDocuments(),
    };
    return NextResponse.json({ seeded: counts.members > 0, counts });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
