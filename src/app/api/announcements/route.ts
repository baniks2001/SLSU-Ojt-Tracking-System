import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Announcement, Student } from '@/lib/models';

// GET - Get announcements
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const studentId = searchParams.get('studentId');
    const isActive = searchParams.get('isActive');

    let query: any = {};

    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    // If student ID is provided, get department-specific announcements
    if (studentId) {
      const student = await Student.findById(studentId);
      if (student) {
        query.$or = [
          { isForAll: true },
          { department: student.ojtAdvisor },
        ];
      }
    } else if (department) {
      query.$or = [
        { isForAll: true },
        { department },
      ];
    }

    const announcements = await Announcement.find(query)
      .populate('postedBy', 'email')
      .populate('department', 'departmentName')
      .sort({ createdAt: -1 });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    return NextResponse.json({ error: 'Failed to get announcements' }, { status: 500 });
  }
}

// POST - Create announcement
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, content, department, postedBy, isForAll = false } = body;

    const announcement = await Announcement.create({
      title,
      content,
      department,
      postedBy,
      isForAll,
    });

    return NextResponse.json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}

// PUT - Update announcement
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { announcementId, updates } = body;

    const announcement = await Announcement.findByIdAndUpdate(
      announcementId,
      { $set: updates },
      { new: true }
    );

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}

// DELETE - Delete announcement
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const announcementId = searchParams.get('announcementId');

    if (!announcementId) {
      return NextResponse.json({ error: 'Announcement ID required' }, { status: 400 });
    }

    const announcement = await Announcement.findByIdAndDelete(announcementId);

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
