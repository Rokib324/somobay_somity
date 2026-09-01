import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Employee from '@/models/Employee';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const branch = searchParams.get('branch') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { empId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }
    if (branch) query.branch = branch;
    if (status) query.status = status;

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .sort({ empId: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalSalary = await Employee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$salary' } } },
    ]);

    return NextResponse.json({
      employees,
      totalMonthlySalary: totalSalary[0]?.total ?? 0,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const count = await Employee.countDocuments();
    const empId = `EMP-${(count + 1).toString().padStart(3, '0')}`;
    const employee = await Employee.create({ ...body, empId });
    return NextResponse.json(employee, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create employee';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
