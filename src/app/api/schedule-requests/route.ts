import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { ScheduleChangeRequest, Student, Department } from '@/lib/models';

// GET - Fetch schedule change requests
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');

    let query: any = {};
    if (studentId) query.studentId = studentId;
    if (departmentId) query.departmentId = departmentId;
    if (status) query.status = status;

    const requests = await ScheduleChangeRequest.find(query)
      .populate('studentId', 'studentId firstName lastName')
      .populate('departmentId', 'departmentName')
      .sort({ requestedAt: -1 });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching schedule change requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

// POST - Create new schedule change request
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { studentId, currentShiftType, requestedShiftType, requestedShiftConfig, reason } = body;

    // Get student's department
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Find department by name
    const department = await Department.findOne({ departmentName: student.department });
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    const scheduleRequest = await ScheduleChangeRequest.create({
      studentId,
      departmentId: department._id,
      currentShiftType,
      requestedShiftType,
      requestedShiftConfig,
      reason,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      message: 'Schedule change request submitted successfully',
      request: scheduleRequest,
    });
  } catch (error) {
    console.error('Error creating schedule change request:', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}

// PUT - Update schedule change request (approve/reject)
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { requestId, status, comments, reviewedBy } = body;

    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'Request ID and status are required' },
        { status: 400 }
      );
    }

    const scheduleRequest = await ScheduleChangeRequest.findById(requestId);
    if (!scheduleRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Update the request
    scheduleRequest.status = status;
    scheduleRequest.comments = comments;
    scheduleRequest.reviewedBy = reviewedBy;
    scheduleRequest.reviewedAt = new Date();
    await scheduleRequest.save();

    // If approved, update student's shift configuration
    if (status === 'approved') {
      const student = await Student.findById(scheduleRequest.studentId);
      if (student) {
        student.shiftType = scheduleRequest.requestedShiftType;
        student.shiftConfig = scheduleRequest.requestedShiftConfig;
        await student.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: `Schedule change request ${status}`,
      request: scheduleRequest,
    });
  } catch (error) {
    console.error('Error updating schedule change request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}
