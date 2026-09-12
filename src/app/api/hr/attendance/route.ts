import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import Employee from '@/models/Employee';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const month = searchParams.get('month'); // YYYY-MM
    const empId = searchParams.get('empId') || '';
    const branch = searchParams.get('branch') || '';
    const search = searchParams.get('search') || '';

    // If month mode
    if (month) {
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr);
      const mIndex = parseInt(monthStr) - 1;

      const startDate = new Date(year, mIndex, 1);
      const endDate = new Date(year, mIndex + 1, 1);

      const query: Record<string, unknown> = {
        date: { $gte: startDate, $lt: endDate },
      };
      if (empId) query.empId = empId;
      if (branch) query.branch = branch;
      if (search) {
        query.$or = [
          { empCode: { $regex: search, $options: 'i' } },
          { empName: { $regex: search, $options: 'i' } },
        ];
      }

      const records = await Attendance.find(query).sort({ date: 1 }).lean();

      // Aggregate by employee
      const employees = await Employee.find(branch ? { branch } : {}).lean();
      const recordsByEmp: Record<string, typeof records> = {};
      records.forEach(r => {
        const id = r.empId.toString();
        if (!recordsByEmp[id]) recordsByEmp[id] = [];
        recordsByEmp[id].push(r);
      });

      const targetEmployees = empId
        ? employees.filter(e => e._id.toString() === empId)
        : employees;

      const monthlyReports = targetEmployees.map(emp => {
        const empRecords = recordsByEmp[emp._id.toString()] || [];
        const presentCount = empRecords.filter(r => r.status === 'Present').length;
        const lateCount = empRecords.filter(r => r.status === 'Late').length;
        const leaveCount = empRecords.filter(r => r.status === 'Leave').length;
        const absentCount = empRecords.filter(r => r.status === 'Absent').length;

        // Approximate total work days in month (excluding Fridays or default 24-26)
        const totalDutyDays = 26;

        return {
          employee: {
            _id: emp._id,
            empId: emp.empId,
            name: emp.name,
            designation: emp.designation,
            department: emp.department,
            branch: emp.branch,
          },
          totalDutyDays,
          totalPresent: presentCount + lateCount,
          presentCount,
          lateCount,
          leaveCount,
          absentCount: Math.max(0, totalDutyDays - (presentCount + lateCount + leaveCount)),
          records: empRecords,
        };
      });

      return NextResponse.json({ monthlyReports, month });
    }

    // Daily Mode
    const queryDate = date || new Date().toISOString().split('T')[0];
    const d = new Date(queryDate);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const query: Record<string, unknown> = { date: { $gte: d, $lt: next } };
    if (branch) query.branch = branch;
    if (empId) query.empId = empId;
    if (search) {
      query.$or = [
        { empCode: { $regex: search, $options: 'i' } },
        { empName: { $regex: search, $options: 'i' } },
      ];
    }

    const attendance = await Attendance.find(query).sort({ empCode: 1 }).lean();

    const summary = await Attendance.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return NextResponse.json({ attendance, summary, date: queryDate });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const targetDate = body.date ? new Date(body.date) : new Date();
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

    const record = await Attendance.findOneAndUpdate(
      { empId: body.empId, date: { $gte: startOfDay, $lt: endOfDay } },
      { ...body, date: startOfDay },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to mark attendance';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
