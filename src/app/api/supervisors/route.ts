import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';

// POST - Create OJT Supervisor account (by Department)
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password, firstName, lastName, contactNumber, departmentId, createdBy } = body;

    if (!email || !password || !firstName || !lastName || !departmentId) {
      return NextResponse.json(
        { error: 'Email, password, first name, last name, and department are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create supervisor user
    const user = await User.create({
      email,
      password: hashedPassword,
      accountType: 'supervisor',
      isActive: true,
      supervisorData: {
        firstName,
        lastName,
        contactNumber,
        departmentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'OJT Supervisor account created successfully',
      user: {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    console.error('Error creating supervisor:', error);
    return NextResponse.json(
      { error: 'Failed to create supervisor account' },
      { status: 500 }
    );
  }
}

// GET - Fetch OJT Supervisors for a department
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    let query: any = { accountType: 'supervisor' };
    if (departmentId) {
      query['supervisorData.departmentId'] = departmentId;
    }

    const supervisors = await User.find(query)
      .select('-password -__v')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      supervisors,
    });
  } catch (error) {
    console.error('Error fetching supervisors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supervisors' },
      { status: 500 }
    );
  }
}

// DELETE - Delete supervisor account
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const supervisorId = searchParams.get('id');

    if (!supervisorId) {
      return NextResponse.json(
        { error: 'Supervisor ID is required' },
        { status: 400 }
      );
    }

    const result = await User.findByIdAndDelete(supervisorId);

    if (!result) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Supervisor account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting supervisor:', error);
    return NextResponse.json(
      { error: 'Failed to delete supervisor' },
      { status: 500 }
    );
  }
}
