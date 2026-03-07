import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Attendance, Student } from '@/lib/models';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { isShiftExpired, getActiveShift } from '@/lib/shift-management';

// GET - Get attendance records
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const query: Record<string, unknown> = {};

    if (studentId) {
      query.studentId = studentId;
    }

    if (date) {
      const targetDate = new Date(date);
      query.date = {
        $gte: startOfDay(targetDate),
        $lte: endOfDay(targetDate),
      };
    }

    if (month && year) {
      const targetMonth = parseInt(month);
      const targetYear = parseInt(year);
      const startDate = startOfMonth(new Date(targetYear, targetMonth - 1));
      const endDate = endOfMonth(new Date(targetYear, targetMonth - 1));
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('studentId', 'firstName lastName studentId shiftType')
      .sort({ date: -1 });

    return NextResponse.json(
      { attendance: attendanceRecords },
      {
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json({ error: 'Failed to get attendance' }, { status: 500 });
  }
}

// POST - Clock in/out
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      studentId,
      action,
      imageData,
      shiftType = 'regular',
    } = body;

    // Use server time only - prevent client time manipulation
    const serverTime = new Date();

    // Find or create attendance record for today
    let attendance = await Attendance.findOne({
      studentId,
      date: {
        $gte: startOfDay(serverTime),
        $lte: endOfDay(serverTime),
      },
    });

    if (!attendance) {
      attendance = await Attendance.create({
        studentId,
        date: serverTime,
        shiftType,
      });
    } else {
      // Update shiftType if different
      if (attendance.shiftType !== shiftType) {
        attendance.shiftType = shiftType;
      }
    }

    // Check for shift expiration before processing clock out actions
    if (action.includes('Out')) {
      // Find the corresponding clock in time to check expiration
      let clockInTime: Date | null = null;
      let shiftTypeToCheck: string = '';
      
      switch (action) {
        case 'morningOut':
          clockInTime = attendance.morningIn;
          shiftTypeToCheck = 'morning';
          break;
        case 'afternoonOut':
          clockInTime = attendance.afternoonIn;
          shiftTypeToCheck = 'afternoon';
          break;
        case 'eveningOut':
          clockInTime = attendance.eveningIn;
          shiftTypeToCheck = 'evening';
          break;
      }

      if (clockInTime && isShiftExpired(clockInTime, serverTime)) {
        return NextResponse.json({
          error: 'Shift has expired',
          message: `The ${shiftTypeToCheck} shift has expired. Please clock in to the current active shift.`,
          expiredShift: shiftTypeToCheck,
          activeShift: getActiveShift(serverTime),
          requiresNewClockIn: true
        }, { status: 400 });
      }
    }

    // Update based on action using server time
    switch (action) {
      case 'morningIn':
        attendance.morningIn = serverTime;
        attendance.morningInImage = imageData;
        break;
      case 'morningOut':
        attendance.morningOut = serverTime;
        attendance.morningOutImage = imageData;
        break;
      case 'afternoonIn':
        attendance.afternoonIn = serverTime;
        attendance.afternoonInImage = imageData;
        break;
      case 'afternoonOut':
        attendance.afternoonOut = serverTime;
        attendance.afternoonOutImage = imageData;
        break;
      case 'eveningIn':
        attendance.eveningIn = serverTime;
        attendance.eveningInImage = imageData;
        break;
      case 'eveningOut':
        attendance.eveningOut = serverTime;
        attendance.eveningOutImage = imageData;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Calculate total hours
    attendance.totalHours = calculateTotalHours(attendance);
    await attendance.save();

    return NextResponse.json({
      success: true,
      attendance,
      serverTime: serverTime.toISOString(),
    });
  } catch (error) {
    console.error('Clock in/out error:', error);
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
  }
}

// PUT - Update attendance
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { attendanceId, updates } = body;

    const attendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      { $set: updates },
      { new: true }
    );

    if (!attendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }

    // Recalculate total hours
    attendance.totalHours = calculateTotalHours(attendance);
    await attendance.save();

    return NextResponse.json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}

// GET - Get attendance statistics for OJT tracking
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const stats = searchParams.get('stats');

    // If stats parameter is present, return statistics
    if (stats === 'true') {
      if (!studentId) {
        return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
      }

      // Get all attendance records for the student
      const attendanceRecords = await Attendance.find({ studentId })
        .sort({ date: 1 });

      let totalHours = 0;
      let daysWorked = 0;

      attendanceRecords.forEach(record => {
        const dayHours = calculateTotalHours(record);
        totalHours += dayHours;
        if (dayHours > 0) {
          daysWorked++;
        }
      });

      return NextResponse.json({
        success: true,
        totalHours: parseFloat(totalHours.toFixed(2)),
        daysWorked,
        averageHoursPerDay: daysWorked > 0 ? parseFloat((totalHours / daysWorked).toFixed(2)) : 0
      });
    }

    // Original attendance logic
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const query: Record<string, unknown> = {};

    if (studentId) {
      query.studentId = studentId;
    }

    if (date) {
      const targetDate = new Date(date);
      query.date = {
        $gte: startOfDay(targetDate),
        $lte: endOfDay(targetDate),
      };
    }

    if (month && year) {
      const targetMonth = parseInt(month);
      const targetYear = parseInt(year);
      const startDate = startOfMonth(new Date(targetYear, targetMonth - 1));
      const endDate = endOfMonth(new Date(targetYear, targetMonth - 1));
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('studentId', 'firstName lastName studentId shiftType')
      .sort({ date: -1 });

    return NextResponse.json(
      { attendance: attendanceRecords },
      {
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('GET attendance error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

function calculateTotalHours(attendance: {
  morningIn?: Date;
  morningOut?: Date;
  afternoonIn?: Date;
  afternoonOut?: Date;
  eveningIn?: Date;
  eveningOut?: Date;
}): number {
  let totalMinutes = 0;

  // Morning shift
  if (attendance.morningIn && attendance.morningOut) {
    const morningMinutes = (attendance.morningOut.getTime() - attendance.morningIn.getTime()) / (1000 * 60);
    totalMinutes += morningMinutes;
  }

  // Afternoon shift
  if (attendance.afternoonIn && attendance.afternoonOut) {
    const afternoonMinutes = (attendance.afternoonOut.getTime() - attendance.afternoonIn.getTime()) / (1000 * 60);
    totalMinutes += afternoonMinutes;
  }

  // Evening shift (graveyard)
  if (attendance.eveningIn && attendance.eveningOut) {
    const eveningMinutes = (attendance.eveningOut.getTime() - attendance.eveningIn.getTime()) / (1000 * 60);
    totalMinutes += eveningMinutes;
  }

  return parseFloat((totalMinutes / 60).toFixed(2));
}
