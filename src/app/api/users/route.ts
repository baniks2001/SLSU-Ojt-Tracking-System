import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User, Student, Department } from '@/lib/models';
import { hashPassword } from '@/lib/auth/password';

// GET - Get users based on account type and filters
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const accountType = searchParams.get('accountType');
    const isActive = searchParams.get('isActive');
    const department = searchParams.get('department');
    const isAccepted = searchParams.get('isAccepted');

    let query: any = {};

    if (accountType) {
      query.accountType = accountType;
    }

    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query).select('-password -__v');

    let enrichedUsers = [];

    for (const user of users) {
      const userObj = user.toObject();
      let details = null;

      if (user.accountType === 'student') {
        const studentQuery: any = { userId: user._id };
        if (department) studentQuery.department = department;
        if (isAccepted !== null) studentQuery.isAccepted = isAccepted === 'true';
        
        details = await Student.findOne(studentQuery).select('-__v');
        if (!details && (department || isAccepted !== null)) continue;
      } else if (user.accountType === 'department') {
        details = await Department.findOne({ userId: user._id }).select('-__v');
      }

      enrichedUsers.push({
        ...userObj,
        details,
      });
    }

    return NextResponse.json({ users: enrichedUsers });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to get users' }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { userId, updates, accountType, profileData } = body;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user fields
    if (updates.email) user.email = updates.email;
    if (updates.isActive !== undefined) user.isActive = updates.isActive;
    if (updates.password) user.password = await hashPassword(updates.password);

    await user.save();

    // Update profile based on account type
    if (accountType === 'student' && profileData) {
      await Student.findOneAndUpdate(
        { userId: user._id },
        { $set: profileData },
        { new: true }
      );
    } else if (accountType === 'department' && profileData) {
      await Department.findOneAndUpdate(
        { userId: user._id },
        { $set: profileData },
        { new: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deletion of super admin
    if (user.accountType === 'superadmin' && user.email === process.env.SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Cannot delete super admin' }, { status: 403 });
    }

    // Delete profile
    if (user.accountType === 'student') {
      await Student.findOneAndDelete({ userId: user._id });
    } else if (user.accountType === 'department') {
      await Department.findOneAndDelete({ userId: user._id });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
