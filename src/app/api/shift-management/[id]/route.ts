import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection-manager';

// Define Shift interface
interface Shift {
  _id?: string;
  shiftName: string;
  shiftType: 'morning' | 'afternoon' | 'evening' | 'midnight';
  timePeriod: 'AM' | 'PM';
  startTime: string;
  endTime: string;
  maxEarlyClockIn: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// In-memory storage for shifts (in production, use MongoDB)
let shifts: Shift[] = [
  {
    _id: '1',
    shiftName: 'Morning Shift',
    shiftType: 'morning',
    timePeriod: 'AM',
    startTime: '08:00',
    endTime: '12:00',
    maxEarlyClockIn: 60,
    description: 'Regular morning shift'
  },
  {
    _id: '2',
    shiftName: 'Afternoon Shift',
    shiftType: 'afternoon',
    timePeriod: 'PM',
    startTime: '13:00',
    endTime: '17:00',
    maxEarlyClockIn: 60,
    description: 'Regular afternoon shift'
  },
  {
    _id: '3',
    shiftName: 'Evening Shift',
    shiftType: 'evening',
    timePeriod: 'PM',
    startTime: '17:00',
    endTime: '21:00',
    maxEarlyClockIn: 60,
    description: 'Regular evening shift'
  }
];

// PUT - Update shift
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const {
      shiftName,
      shiftType,
      timePeriod,
      startTime,
      endTime,
      maxEarlyClockIn,
      description
    } = body;

    // Validate required fields
    if (!shiftName || !shiftType || !timePeriod || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find shift by ID
    const shiftIndex = shifts.findIndex(shift => shift._id === id);
    if (shiftIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Shift not found' },
        { status: 404 }
      );
    }

    // Update shift
    const updatedShift: Shift = {
      ...shifts[shiftIndex],
      shiftName,
      shiftType,
      timePeriod,
      startTime,
      endTime,
      maxEarlyClockIn: maxEarlyClockIn || 60,
      description: description || '',
      updatedAt: new Date()
    };

    shifts[shiftIndex] = updatedShift;

    return NextResponse.json({
      success: true,
      message: 'Shift updated successfully',
      shift: updatedShift
    });
  } catch (error) {
    console.error('Error updating shift:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update shift' },
      { status: 500 }
    );
  }
}

// DELETE - Delete shift
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    // Find shift by ID
    const shiftIndex = shifts.findIndex(shift => shift._id === id);
    if (shiftIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Shift not found' },
        { status: 404 }
      );
    }

    // Remove shift
    shifts.splice(shiftIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Shift deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shift:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete shift' },
      { status: 500 }
    );
  }
}
