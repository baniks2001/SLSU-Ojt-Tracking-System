import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User, Student, Department } from '@/lib/models';
import { hashPassword, comparePasswords } from '@/lib/auth/password';
import { sendPasswordResetEmail } from '@/lib/auth/email';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'login':
        return handleLogin(body);
      case 'register':
        return handleRegister(body);
      case 'forgotPassword':
        return handleForgotPassword(body);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleLogin({ email, password }: { email: string; password: string }) {
  try {
    // Check for Super Admin first (before checking if user exists in DB)
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    
    // If this is the SuperAdmin login with correct env credentials
    if (email === superAdminEmail && password === superAdminPassword) {
      // Find or create SuperAdmin user
      let user = await User.findOne({ email });
      
      if (!user) {
        // Create SuperAdmin if not exists
        const hashedPassword = await hashPassword(superAdminPassword!);
        user = await User.create({
          email,
          password: hashedPassword,
          accountType: 'superadmin',
          isActive: true,
        });
      } else if (user.accountType !== 'superadmin') {
        // Upgrade to superadmin if needed
        user.accountType = 'superadmin';
        const hashedPassword = await hashPassword(superAdminPassword!);
        user.password = hashedPassword;
        await user.save();
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, accountType: user.accountType },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: '24h' }
      );

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          accountType: user.accountType,
          details: null,
        },
      });
    }

    // Regular user login flow
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 });
    }

    const isValidPassword = await comparePasswords(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, accountType: user.accountType },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '24h' }
    );

    // Get user details based on account type
    let userDetails = null;
    if (user.accountType === 'student') {
      userDetails = await Student.findOne({ userId: user._id }).select('-__v');
    } else if (user.accountType === 'department') {
      userDetails = await Department.findOne({ userId: user._id }).select('-__v');
    }

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
        details: userDetails,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

async function handleRegister({ 
  email, 
  password, 
  accountType, 
  studentData, 
  departmentData 
}: { 
  email: string; 
  password: string; 
  accountType: string;
  studentData?: any;
  departmentData?: any;
}) {
  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Check if student ID already exists (for student registration)
    if (accountType === 'student' && studentData?.studentId) {
      const existingStudent = await Student.findOne({ studentId: studentData.studentId });
      if (existingStudent) {
        return NextResponse.json({ error: 'Student ID already registered' }, { status: 400 });
      }
    }

    // Check if department code already exists (for department registration)
    if (accountType === 'department' && departmentData?.departmentCode) {
      const existingDept = await Department.findOne({ departmentCode: departmentData.departmentCode });
      if (existingDept) {
        return NextResponse.json({ error: 'Department code already exists' }, { status: 400 });
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      accountType,
    });

    // Create profile based on account type
    if (accountType === 'student' && studentData) {
      await Student.create({
        userId: user._id,
        ...studentData,
        isAccepted: false,
      });
    } else if (accountType === 'department' && departmentData) {
      await Department.create({
        userId: user._id,
        ...departmentData,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please wait for approval if you registered as a student.',
      userId: user._id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

async function handleForgotPassword({ email }: { email: string }) {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(4).toString('hex');
    const hashedTempPassword = await hashPassword(tempPassword);

    // Update user password
    user.password = hashedTempPassword;
    await user.save();

    // Send email
    try {
      await sendPasswordResetEmail(email, tempPassword);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails - user can contact admin
    }

    return NextResponse.json({
      success: true,
      message: 'A temporary password has been sent to your email.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
