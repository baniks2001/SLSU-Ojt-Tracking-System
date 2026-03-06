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

    const enrichedUsers = [];

    // If no accountType specified, get all users from all collections
    if (!accountType) {
      // Get users from User collection (admin, department, superadmin)
      const userQuery: Record<string, unknown> = {};
      if (isActive !== null) userQuery.isActive = isActive === 'true';

      const users = await User.find(userQuery).select('-password -__v');

      for (const user of users) {
        const userObj = user.toObject();
        let details = null;

        if (user.accountType === 'student') {
          const studentQuery: Record<string, unknown> = { userId: user._id };
          if (department) studentQuery.department = department;
          if (isAccepted !== null) studentQuery.isAccepted = isAccepted === 'true';
          
          details = await Student.findOne(studentQuery)
            .populate('courseId', 'courseName courseCode departmentName campusId')
            .populate('campusId', 'campusName campusCode')
            .select('-__v');
          
          if (!details && (department || isAccepted !== null)) continue;
          
          // Add course information to the student details
          if (details) {
            const detailsObj = details.toObject();
            details = {
              ...detailsObj,
              course: detailsObj.courseId?.courseName || detailsObj.course || 'Not Assigned',
              courseCode: detailsObj.courseId?.courseCode || '',
              campus: detailsObj.campusId?.campusName || 'Not Assigned',
              campusCode: detailsObj.campusId?.campusCode || '',
            };
          }
        } else if (user.accountType === 'department') {
          details = await Department.findOne({ userId: user._id }).select('-__v');
        }

        enrichedUsers.push({
          ...userObj,
          details,
        });
      }

      // Also get students directly from Student collection for those without User records
      const studentQuery: Record<string, unknown> = {};
      if (department) studentQuery.department = department;
      if (isAccepted !== null) studentQuery.isAccepted = isAccepted === 'true';
      if (isActive !== null) {
        const studentUsers = await Student.find(studentQuery)
          .populate('courseId', 'courseName courseCode departmentName campusId')
          .populate('campusId', 'campusName campusCode')
          .select('-__v');
        
        for (const student of studentUsers) {
          const studentObj = student.toObject();
          const user = await User.findById(student.userId).select('-password -__v');
          
          if (user) {
            // Add course information to the student details
            const enrichedStudentObj = {
              ...studentObj,
              course: studentObj.courseId?.courseName || studentObj.course || 'Not Assigned',
              courseCode: studentObj.courseId?.courseCode || '',
              campus: studentObj.campusId?.campusName || 'Not Assigned',
              campusCode: studentObj.campusId?.campusCode || '',
            };
            
            enrichedUsers.push({
              ...user.toObject(),
              details: enrichedStudentObj,
            });
          }
        }
      }
    } else {
      // Specific account type query
      if (accountType === 'student') {
        // For students, query Student collection
        const studentQuery: Record<string, unknown> = {};
        if (department) studentQuery.department = department;
        if (isAccepted !== null) studentQuery.isAccepted = isAccepted === 'true';
        
        const students = await Student.find(studentQuery)
          .populate('courseId', 'courseName courseCode departmentName campusId')
          .populate('campusId', 'campusName campusCode')
          .select('-__v');
        
        for (const student of students) {
          const studentObj = student.toObject();
          const user = await User.findById(student.userId).select('-password -__v');
          
          if (user) {
            // Add course information to the student details
            const enrichedStudentObj = {
              ...studentObj,
              course: studentObj.courseId?.courseName || studentObj.course || 'Not Assigned',
              courseCode: studentObj.courseId?.courseCode || '',
              campus: studentObj.campusId?.campusName || 'Not Assigned',
              campusCode: studentObj.campusId?.campusCode || '',
            };
            
            enrichedUsers.push({
              ...user.toObject(),
              details: enrichedStudentObj,
            });
          }
        }
      } else {
        // For other account types, query User collection
        const query: Record<string, unknown> = { accountType };
        if (isActive !== null) query.isActive = isActive === 'true';

        const users = await User.find(query).select('-password -__v');

        for (const user of users) {
          const userObj = user.toObject();
          let details = null;

          if (user.accountType === 'department') {
            details = await Department.findOne({ userId: user._id }).select('-__v');
          }

          enrichedUsers.push({
            ...userObj,
            details,
          });
        }
      }
    }

    return NextResponse.json(
      { users: enrichedUsers },
      {
        headers: {
          'Cache-Control': 'private, max-age=10, stale-while-revalidate=30',
        },
      }
    );
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
    const { userId, updates, accountType, profileData, requesterAccountType } = body;

    // Check if password update is being attempted
    if (updates.password && requesterAccountType !== 'superadmin') {
      return NextResponse.json(
        { error: 'Only super administrators can update passwords' },
        { status: 403 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent regular admin from updating super admin
    if (requesterAccountType === 'admin' && user.accountType === 'superadmin') {
      return NextResponse.json(
        { error: 'Regular administrators cannot modify super administrator accounts' },
        { status: 403 }
      );
    }

    // Prevent regular admin from updating other admin accounts
    if (requesterAccountType === 'admin' && user.accountType === 'admin' && userId !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Regular administrators can only update their own accounts' },
        { status: 403 }
      );
    }

    // Update user fields
    if (updates.email) user.email = updates.email;
    if (updates.isActive !== undefined) user.isActive = updates.isActive;
    if (updates.password && requesterAccountType === 'superadmin') {
      user.password = await hashPassword(updates.password);
    }

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

    // Log the update
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/system-activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          userType: user.accountType,
          action: updates.password ? 'PASSWORD_UPDATED' : 'USER_UPDATED',
          description: `User ${user.email} was updated by ${requesterAccountType}`,
          severity: user.accountType === 'superadmin' ? 'high' : 'medium',
          metadata: {
            updatedBy: requesterAccountType,
            updatedFields: Object.keys(updates),
            updateTime: new Date()
          }
        })
      });
    } catch (logError) {
      // Silent error handling
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
