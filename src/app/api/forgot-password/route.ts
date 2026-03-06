import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User, Student, Department } from '@/lib/models';
import crypto from 'crypto';
import { hashPassword } from '@/lib/auth/password';
import { sendTemporaryPasswordEmail } from '@/lib/auth/email';

// Generate secure temporary password
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// POST - Send temporary password for password reset
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    let user = await User.findOne({ email });
    let userType = 'user';
    if (!user) {
      // Try student collection
      user = await Student.findOne({ email });
      if (user) userType = 'student';
    }
    if (!user) {
      // Try department collection
      user = await Department.findOne({ email });
      if (user) userType = 'department';
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(temporaryPassword);

    // Update user password with temporary password
    if (userType === 'user') {
      await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    } else if (userType === 'student') {
      await User.findByIdAndUpdate(user.userId, { password: hashedPassword });
    } else if (userType === 'department') {
      await User.findByIdAndUpdate(user.userId, { password: hashedPassword });
    }

    // Send temporary password email
    try {
      const userName = user.firstName || user.departmentName || 'User';
      await sendTemporaryPasswordEmail(email, temporaryPassword, userName);
    } catch (emailError) {
      console.error('Failed to send temporary password email:', emailError);
      // Continue even if email fails
    }

    // Log the password reset
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/system-activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: email,
          userType: userType,
          action: 'PASSWORD_RESET',
          description: `Temporary password sent to ${email}`,
          severity: 'medium',
          metadata: {
            resetMethod: 'temporary_password',
            timestamp: new Date()
          }
        })
      });
    } catch (logError) {
      // Silent error handling
    }

    return NextResponse.json({
      success: true,
      message: 'Temporary password sent to your email address',
      instructions: 'Please check your email and use the temporary password to log in, then change your password immediately.',
      // For development only - remove in production
      temporaryPassword: process.env.NODE_ENV === 'development' ? temporaryPassword : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send temporary password' 
      },
      { status: 500 }
    );
  }
}

// GET - Check if email exists (for validation)
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await User.findOne({ email });
    let userType = 'user';
    if (!user) {
      user = await Student.findOne({ email });
      if (user) userType = 'student';
    }
    if (!user) {
      user = await Department.findOne({ email });
      if (user) userType = 'department';
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account found',
      userType: userType
    });

  } catch (error) {
    console.error('Email validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to validate email' 
      },
      { status: 500 }
    );
  }
}
