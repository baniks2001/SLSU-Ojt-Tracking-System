import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { SystemLog } from '@/lib/models';

// GET - Fetch system logs with filters
export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType');
    const action = searchParams.get('action');
    const severity = searchParams.get('severity');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    
    let query: any = {};
    
    if (userType) query.userType = userType;
    if (action) query.action = { $regex: action, $options: 'i' };
    if (severity) query.severity = severity;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (page - 1) * limit;
    
    const logs = await SystemLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    const total = await SystemLog.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Cache-Control': 'private, max-age=5',
      },
    });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system logs' },
      { status: 500 }
    );
  }
}

// POST - Create system log entry
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const log = await SystemLog.create(body);
    
    return NextResponse.json({
      success: true,
      log,
    });
  } catch (error) {
    console.error('Error creating system log:', error);
    return NextResponse.json(
      { error: 'Failed to create system log' },
      { status: 500 }
    );
  }
}

// DELETE - Clear old logs (admin only)
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await SystemLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });
    
    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} logs deleted`,
    });
  } catch (error) {
    console.error('Error clearing system logs:', error);
    return NextResponse.json(
      { error: 'Failed to clear system logs' },
      { status: 500 }
    );
  }
}
