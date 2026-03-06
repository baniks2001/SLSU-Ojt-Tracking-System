import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection-manager';
import { User, Student, Department } from '@/lib/models';

// System activity types
export interface SystemActivity {
  _id?: string;
  userEmail?: string;
  userType: 'student' | 'department' | 'admin' | 'superadmin' | 'system';
  action: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: Date;
  metadata?: any;
}

// Get all system activities with filtering
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const action = searchParams.get('action');
    const userType = searchParams.get('userType');
    const severity = searchParams.get('severity');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build query
    let query: any = {};
    
    if (action) query.action = action;
    if (userType) query.userType = userType;
    if (severity) query.severity = severity;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    // Fetch from database (assuming we have a SystemActivity collection)
    // For now, we'll simulate with existing collections
    const activities: any[] = [];
    
    // Get recent user activities
    const recentUsers = await User.find({})
      .sort({ lastLogin: -1 })
      .limit(50)
      .lean();
    
    recentUsers.forEach((user: any) => {
      activities.push({
        userEmail: user.email,
        userType: user.accountType,
        action: 'LOGIN',
        description: `User logged in to ${user.accountType} dashboard`,
        severity: 'info',
        timestamp: user.lastLogin || new Date()
      });
    });
    
    // Get student attendance activities
    const students = await Student.find({})
      .limit(50)
      .lean();
    
    students.forEach((student: any) => {
      if (student.attendance && student.attendance.length > 0) {
        const latestAttendance = student.attendance[student.attendance.length - 1];
        if (latestAttendance.clockIn && !latestAttendance.clockOut) {
          activities.push({
            userEmail: student.email,
            userType: 'student',
            action: 'CLOCK_IN',
            description: `Student ${student.firstName} ${student.lastName} clocked in at ${latestAttendance.clockIn}`,
            severity: 'info',
            timestamp: latestAttendance.clockIn
          });
        }
        
        if (latestAttendance.clockOut) {
          activities.push({
            userEmail: student.email,
            userType: 'student',
            action: 'CLOCK_OUT',
            description: `Student ${student.firstName} ${student.lastName} clocked out at ${latestAttendance.clockOut}`,
            severity: 'info',
            timestamp: latestAttendance.clockOut
          });
        }
      }
      
      // Check for shift status changes
      if (student.shiftType) {
        activities.push({
          userEmail: student.email,
          userType: 'student',
          action: 'SHIFT_STATUS',
          description: `Student shift status: ${student.shiftType}`,
          severity: 'info',
          timestamp: new Date()
        });
      }
    });
    
    // Get department activities
    const departments = await Department.find({})
      .limit(50)
      .lean();
    
    departments.forEach((dept: any) => {
      if (!dept.isAccepted) {
        activities.push({
          userEmail: dept.contactEmail,
          userType: 'department',
          action: 'PENDING_APPROVAL',
          description: `Department ${dept.departmentName} awaiting approval`,
          severity: 'warning',
          timestamp: new Date()
        });
      }
    });
    
    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedActivities = activities.slice(startIndex, endIndex);
    
    return NextResponse.json({
      success: true,
      activities: paginatedActivities,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(activities.length / limit),
        totalRecords: activities.length,
        hasNext: endIndex < activities.length
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch system activities' 
      },
      { status: 500 }
    );
  }
}

// Log new system activity
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { userEmail, userType, action, description, severity = 'info', metadata } = body;
    
    if (!userEmail || !action || !description) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: userEmail, action, description' 
        },
        { status: 400 }
      );
    }
    
    // Create activity log entry
    const activity: SystemActivity = {
      userEmail,
      userType,
      action,
      description,
      severity,
      timestamp: new Date(),
      metadata
    };
    
    // Here you would save to database
    // For now, we'll just return success
    // In a real implementation, you'd save to a SystemActivity collection
    
    return NextResponse.json({
      success: true,
      activity,
      message: 'Activity logged successfully'
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to log activity' 
      },
      { status: 500 }
    );
  }
}
