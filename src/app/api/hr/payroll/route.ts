import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Employee from '@/models/Employee';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const branch = searchParams.get('branch') || '';

    const query: Record<string, unknown> = { status: 'active' };
    if (branch) query.branch = branch;

    const employees = await Employee.find(query).lean();

    // Build payroll sheet
    const payroll = employees.map(emp => ({
      empId: emp.empId,
      name: emp.name,
      designation: emp.designation,
      branch: emp.branch,
      basicSalary: emp.salary,
      houseAllowance: Math.round(emp.salary * 0.3),
      medicalAllowance: Math.round(emp.salary * 0.1),
      transportAllowance: Math.round(emp.salary * 0.05),
      grossSalary: Math.round(emp.salary * 1.45),
      providentFund: Math.round(emp.salary * 0.05),
      incomeTax: emp.salary > 50000 ? Math.round(emp.salary * 0.05) : 0,
      netSalary: Math.round(emp.salary * 1.45 * 0.9),
      month,
      year,
      status: 'pending',
    }));

    const totalGross = payroll.reduce((s, p) => s + p.grossSalary, 0);
    const totalNet = payroll.reduce((s, p) => s + p.netSalary, 0);

    return NextResponse.json({ payroll, totalGross, totalNet, month, year });
  } catch {
    return NextResponse.json({ error: 'Failed to generate payroll' }, { status: 500 });
  }
}
