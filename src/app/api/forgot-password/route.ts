import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User, Student, Department } from '@/lib/models';
import crypto from 'crypto';
import { sendOTPEmail } from '@/lib/auth/email';

// Generate OTP code
function generateOTPCode(): string {
  return crypto.randomInt(100000, 999999).toString().padStart(6, '0');
}

// Store OTP codes (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expires: Date; email: string }>();

// POST - Send OTP for password reset
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
    if (!user) {
      // Try student collection
      user = await Student.findOne({ email });
    }
    if (!user) {
      // Try department collection
      user = await Department.findOne({ email });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    // Generate OTP code
    const otpCode = generateOTPCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Store OTP (in production, use proper database storage)
    otpStore.set(email, {
      code: otpCode,
      expires: expiresAt,
      email
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otpCode, user.firstName || user.departmentName || 'User');
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'OTP code sent to your email',
      expiresIn: '15 minutes',
      // For development only - remove in production
      otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send OTP code' 
      },
      { status: 500 }
    );
  }
}

// PUT - Verify OTP and reset password
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, otpCode, newPassword } = body;

    if (!email || !otpCode || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate OTP
    const storedOTP = otpStore.get(email);
    if (!storedOTP || storedOTP.code !== otpCode || storedOTP.expires < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP code' },
        { status: 400 }
      );
    }

    // Find user and update password
    let user = await User.findOne({ email });
    if (!user) {
      user = await Student.findOne({ email });
    }
    if (!user) {
      user = await Department.findOne({ email });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    if (user.accountType) {
      // User model
      await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    } else {
      // Student model
      await Student.findByIdAndUpdate(user._id, { password: hashedPassword });
    }

    // Clear OTP
    otpStore.delete(email);

    // Log system activity
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/system-activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: email,
          userType: user.accountType || user.constructor.modelName.toLowerCase(),
          action: 'PASSWORD_RESET',
          description: `User successfully reset password using OTP verification`,
          severity: 'info',
          metadata: {
            resetTime: new Date(),
            method: 'OTP'
          }
        })
      });
    } catch (logError) {
      // Silent error handling
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset password' 
      },
      { status: 500 }
    );
  }
}

// GET - Check OTP status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const storedOTP = otpStore.get(email);
    
    if (!storedOTP) {
      return NextResponse.json({
        success: false,
        message: 'No OTP code found for this email'
      });
    }

    const isValid = storedOTP.code !== undefined && storedOTP.expires > new Date();
    const timeRemaining = Math.max(0, Math.floor((storedOTP.expires.getTime() - Date.now()) / (1000 * 60)));

    return NextResponse.json({
      success: true,
      isValid,
      timeRemaining,
      expiresIn: storedOTP.expires.toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check OTP status' 
      },
      { status: 500 }
    );
  }
}
