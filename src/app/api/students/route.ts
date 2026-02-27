import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongoose';
import { Student, User } from '@/lib/models';
import { sendAccountApprovedEmail } from '@/lib/auth/email';

// GET - Get students with filters
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const isAccepted = searchParams.get('isAccepted');
    const ojtAdvisor = searchParams.get('ojtAdvisor');
    const isActive = searchParams.get('isActive');

    let query: any = {};

    if (department) query.department = department;
    if (isAccepted !== null) query.isAccepted = isAccepted === 'true';
    if (ojtAdvisor) query.ojtAdvisor = ojtAdvisor;
    if (isActive !== null) query.isActive = isActive === 'true';

    const students = await Student.find(query)
      .populate('userId', 'email')
      .populate('ojtAdvisor', 'departmentName ojtAdvisorName')
      .select('-__v');

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json({ error: 'Failed to get students' }, { status: 500 });
  }
}

// PUT - Accept/Update student
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { studentId, updates, action, ojtAdvisorId } = body;

    const student = await Student.findById(studentId).populate('userId');
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (action === 'accept') {
      student.isAccepted = true;
      if (ojtAdvisorId) {
        student.ojtAdvisor = new mongoose.Types.ObjectId(ojtAdvisorId);
      }
      await student.save();

      // Send approval email
      try {
        await sendAccountApprovedEmail(
          (student.userId as any).email,
          student.firstName
        );
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      return NextResponse.json({
        success: true,
        message: 'Student accepted successfully',
        student,
      });
    }

    if (updates) {
      Object.assign(student, updates);
      await student.save();
    }

    return NextResponse.json({
      success: true,
      student,
    });
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

// DELETE - Delete student
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Delete associated user
    await User.findByIdAndDelete(student.userId);
    
    // Delete student
    await Student.findByIdAndDelete(studentId);

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
