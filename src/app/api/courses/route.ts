import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Course, Department } from '@/lib/models';

// GET - Fetch courses
export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const forRegistration = searchParams.get('forRegistration');
    
    let query: any = { isActive: true };
    
    if (departmentId) {
      query.departmentId = departmentId;
    }
    
    const courses = await Course.find(query)
      .populate('departmentId', 'departmentName departmentCode')
      .select('-__v')
      .sort({ courseName: 1 });
    
    return NextResponse.json({
      success: true,
      courses,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST - Create new course
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { courseCode, courseName, departmentId, description, duration } = body;
    
    if (!courseCode || !courseName || !departmentId) {
      return NextResponse.json(
        { error: 'Course code, name, and department are required' },
        { status: 400 }
      );
    }
    
    // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course code already exists' },
        { status: 400 }
      );
    }
    
    const course = await Course.create({
      courseCode,
      courseName,
      departmentId,
      description,
      duration: duration || '4 years',
    });
    
    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

// PUT - Update course
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { courseId, updates } = body;
    
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }
    
    const course = await Course.findByIdAndUpdate(
      courseId,
      { $set: updates },
      { new: true }
    );
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE - Delete course
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('id');
    
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }
    
    const course = await Course.findByIdAndDelete(courseId);
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
