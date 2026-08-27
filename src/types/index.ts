export interface Member {
  id: string;
  accountNo: string;
  name: string;
  fatherName: string;
  motherName: string;
  mobile: string;
  nid: string;
  category: string;
  branch: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  totalDeposit: number;
  totalLoan: number;
  photoUrl?: string;
  address?: string;
}

export interface DepositAccount {
  id: string;
  accountNo: string;
  memberName: string;
  memberId: string;
  type: 'Daily Savings' | 'Monthly DPS' | 'Fixed Deposit (FDR)' | 'Share Capital';
  amount: number;
  interestRate: number;
  termMonths?: number;
  openingDate: string;
  status: 'active' | 'matured' | 'closed';
  balance: number;
}

export interface LoanAccount {
  id: string;
  loanNo: string;
  memberName: string;
  memberId: string;
  productName: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  installments: number;
  installmentType: 'Daily' | 'Weekly' | 'Monthly';
  disbursementDate: string;
  status: 'active' | 'pending_approval' | 'disbursed' | 'closed' | 'overdue';
}

export interface AccountHead {
  id: string;
  code: string;
  name: string;
  group: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  type: string;
  parentCode?: string;
  balance: number;
  status: 'active' | 'inactive';
}

export interface Employee {
  id: string;
  empId: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  joinDate: string;
  salary: number;
  status: 'active' | 'on_leave' | 'terminated';
}

export interface AttendanceRecord {
  id: string;
  empId: string;
  empName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Late' | 'Absent' | 'Leave';
  notes?: string;
}

export interface SMSHistory {
  id: string;
  recipient: string;
  phone: string;
  message: string;
  sentAt: string;
  status: 'Delivered' | 'Failed' | 'Pending';
  type: 'Transaction' | 'Notification' | 'Bulk';
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  manager: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  totalMembers: number;
}

export interface UserRole {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Branch Manager' | 'Accountant' | 'Field Officer';
  branch: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}
