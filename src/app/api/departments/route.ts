import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Department, User } from '@/lib/models';
import { sendDepartmentApprovedEmail } from '@/lib/auth/email';

// GET - Fetch departments
export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'approved', 'pending', or 'all'
    const forRegistration = searchParams.get('forRegistration'); // 'true' to get only approved for student registration
    
    let query: any = {};
    
    if (forRegistration === 'true') {
      // For student registration - only get approved and active departments
      query = { isAccepted: true, isActive: true };
    } else if (status === 'approved') {
      query = { isAccepted: true };
    } else if (status === 'pending') {
      query = { isAccepted: false };
    }
    
    const departments = await Department.find(query)
      .populate('userId', 'email isActive')
      .select('-__v')
      .sort({ departmentName: 1 });
    
    return NextResponse.json(
      {
        success: true,
        departments,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

// PUT - Update department (accept/reject)
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { departmentId, action, isActive } = body;
    
    if (!departmentId) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      );
    }
    
    const updateData: any = {};
    
    if (action === 'accept') {
      updateData.isAccepted = true;
    } else if (action === 'reject') {
      updateData.isAccepted = false;
    }
    
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }
    
    const department = await Department.findByIdAndUpdate(
      departmentId,
      updateData,
      { new: true }
    );
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    // If rejecting or deactivating, also deactivate the user account
    if (action === 'reject' || isActive === false) {
      await User.findByIdAndUpdate(department.userId, { isActive: false });
    } else if (action === 'accept' || isActive === true) {
      await User.findByIdAndUpdate(department.userId, { isActive: true });
    }
    
    // Send approval email when department is accepted
    if (action === 'accept') {
      try {
        // Get user email from the userId reference
        const user = await User.findById(department.userId);
        if (user && user.email) {
          await sendDepartmentApprovedEmail(
            user.email,
            department.departmentName,
            department.ojtAdvisorName
          );
        }
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
        // Continue even if email fails - don't block the approval
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Department ${action === 'accept' ? 'approved' : action === 'reject' ? 'rejected' : 'updated'} successfully`,
      department,
    });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

// DELETE - Delete department
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('id');
    
    if (!departmentId) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      );
    }
    
    const department = await Department.findById(departmentId);
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Delete associated user
    await User.findByIdAndDelete(department.userId);
    
    // Delete department
    await Department.findByIdAndDelete(departmentId);
    
    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}
