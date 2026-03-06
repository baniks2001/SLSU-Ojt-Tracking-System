import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection-manager';
import { Student } from '@/lib/models';
import { handleShiftExpiration, getActiveShift } from '@/lib/shift-management';

// Handle shift expiration and transition
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { studentId, force = false } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check shift expiration status
    const shiftStatus = handleShiftExpiration(student);
    
    if (!shiftStatus.shouldTransition && !force) {
      return NextResponse.json({
        success: true,
        message: shiftStatus.message,
        requiresAction: false,
        currentShift: getActiveShift(),
        studentShift: student.shiftType
      });
    }

    // Handle shift transition
    if (shiftStatus.shouldTransition || force) {
      // Update the latest attendance record to mark as expired
      if (student.attendance && student.attendance.length > 0) {
        const latestAttendance = student.attendance[student.attendance.length - 1];
        
        // Mark the expired shift
        latestAttendance.clockOut = new Date();
        latestAttendance.notes = `Shift expired automatically - ${shiftStatus.message}`;
        latestAttendance.isExpired = true;
        latestAttendance.expiredAt = new Date();
      }

      // Update student's current shift
      student.shiftType = shiftStatus.nextShift;
      student.lastShiftTransition = new Date();
      
      // Log the transition
      student.shiftHistory = student.shiftHistory || [];
      student.shiftHistory.push({
        fromShift: shiftStatus.expiredShift,
        toShift: shiftStatus.nextShift,
        transitionTime: new Date(),
        reason: 'Shift expiration',
        automatic: true
      });

      await student.save();

      // Log system activity
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/system-activities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: student.email,
            userType: 'student',
            action: 'SHIFT_EXPIRED',
            description: `Student ${student.firstName} ${student.lastName}'s ${shiftStatus.expiredShift} shift expired and transitioned to ${shiftStatus.nextShift}`,
            severity: 'warning',
            metadata: {
              studentId: student._id,
              expiredShift: shiftStatus.expiredShift,
              newShift: shiftStatus.nextShift,
              transitionTime: new Date()
            }
          })
        });
      } catch (logError) {
        // Silent error handling for logging
      }

      return NextResponse.json({
        success: true,
        message: `Shift transition completed: ${shiftStatus.message}`,
        requiresAction: true,
        previousShift: shiftStatus.expiredShift,
        newShift: shiftStatus.nextShift,
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          shiftType: student.shiftType,
          lastShiftTransition: student.lastShiftTransition
        }
      });
    }

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to handle shift expiration' 
      },
      { status: 500 }
    );
  }
}

// Check shift status for multiple students
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const checkAll = searchParams.get('checkAll') === 'true';

    if (studentId) {
      // Check specific student
      const student = await Student.findById(studentId);
      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student not found' },
          { status: 404 }
        );
      }

      const shiftStatus = handleShiftExpiration(student);
      const activeShift = getActiveShift();

      return NextResponse.json({
        success: true,
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          shiftType: student.shiftType,
          lastShiftTransition: student.lastShiftTransition
        },
        shiftStatus,
        activeShift,
        requiresAction: shiftStatus.shouldTransition
      });
    } else if (checkAll) {
      // Check all students with active attendance
      const students = await Student.find({
        'attendance.clockOut': { $exists: false }
      });

      const results = students.map(student => {
        const shiftStatus = handleShiftExpiration(student);
        return {
          studentId: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          currentShift: student.shiftType,
          shiftStatus,
          requiresAction: shiftStatus.shouldTransition
        };
      });

      const expiredStudents = results.filter(r => r.requiresAction);

      return NextResponse.json({
        success: true,
        totalStudents: results.length,
        expiredStudents: expiredStudents.length,
        results,
        expiredStudentsList: expiredStudents
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request parameters' },
      { status: 400 }
    );

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check shift status' 
      },
      { status: 500 }
    );
  }
}
