import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User, Student } from '@/lib/models';
import { hashPassword } from '@/lib/auth/password';

// PUT - Update user password
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const body = await request.json();
    const { password, requesterAccountType } = body;
    const { id } = await context.params;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const user = await User.findById(id);
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
    if (requesterAccountType === 'admin' && user.accountType === 'admin' && id !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Regular administrators can only update their own accounts' },
        { status: 403 }
      );
    }

    // Update password
    user.password = await hashPassword(password);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
