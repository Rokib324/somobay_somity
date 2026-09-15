export interface Nominee {
  name: string;
  relation: string;
  nid?: string;
  phone?: string;
  percentage: number;
  picture?: string;
  photo?: string;
  signature?: string;
  dateOfBirth?: string;
  address?: string;
  occupation?: string;
  fatherOrHusbandName?: string;
}

export interface Guarantor {
  accountNo?: string;
  name: string;
  relation?: string;
  nid?: string;
  phone?: string;
  address?: string;
  occupation?: string;
  photo?: string;
  signature?: string;
  status?: string;
}

export interface Member {
  id: string;
  _id?: string;
  accountNo: string;
  name: string;
  fatherName: string;
  motherName: string;
  spouseName?: string;
  dateOfBirth?: string;
  mobile: string;
  phone?: string;
  nid: string;
  category: string;
  branch: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  totalDeposit: number;
  totalLoan: number;
  photo?: string;
  photoUrl?: string;
  signature?: string;
  address?: string;
  nominee?: Nominee;
  guarantor?: Guarantor;
}

export interface DepositAccount {
  id: string;
  _id?: string;
  accountNo: string;
  memberName: string;
  memberId: string;
  type: string;
  amount: number;
  interestRate: number;
  termMonths?: number;
  openingDate: string;
  status: 'active' | 'matured' | 'closed';
  balance: number;
  category?: string;
  percentage?: number;
  priority?: 'High' | 'Medium' | 'Low' | 'Normal';
}

export interface LoanAccount {
  id: string;
  _id?: string;
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
  applicationDate?: string;
  status: 'active' | 'pending_approval' | 'disbursed' | 'closed' | 'overdue' | string;
  branch?: string;
  purpose?: string;
  guarantorMemberId?: string;
  guarantorAccountNo?: string;
  guarantorName?: string;
  guarantorNid?: string;
  guarantorPhone?: string;
  guarantorRelation?: string;
  guarantorPhoto?: string;
  guarantorSignature?: string;
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
  employeeId?: string;
  role: 'Super Admin' | 'Branch Manager' | 'Operations In-Charge' | 'Teller' | 'Back-Office';
  branch: string;
  status: 'Active' | 'Inactive' | 'Locked';
  transactionLimit: number;
  lastLogin: string;
  mustChangePassword: boolean;
}
