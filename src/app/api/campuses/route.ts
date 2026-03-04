import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Campus } from '@/lib/models';

// GET - Fetch campuses
export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const forRegistration = searchParams.get('forRegistration');
    const status = searchParams.get('status');
    
    let query: any = {};
    
    if (forRegistration === 'true') {
      // For registration - only get active campuses
      query = { isActive: true };
    } else if (status === 'active') {
      query = { isActive: true };
    } else if (status === 'inactive') {
      query = { isActive: false };
    }
    
    const campuses = await Campus.find(query)
      .select('-__v')
      .sort({ campusName: 1 });
    
    return NextResponse.json({
      success: true,
      campuses,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching campuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campuses' },
      { status: 500 }
    );
  }
}

// POST - Create new campus
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { campusName, campusCode, location, address, contactEmail, contactNumber } = body;
    
    if (!campusName || !campusCode || !location) {
      return NextResponse.json(
        { error: 'Campus name, code, and location are required' },
        { status: 400 }
      );
    }
    
    // Check if campus code already exists
    const existingCampus = await Campus.findOne({ 
      $or: [{ campusCode }, { campusName }] 
    });
    
    if (existingCampus) {
      return NextResponse.json(
        { error: 'Campus code or name already exists' },
        { status: 400 }
      );
    }
    
    const campus = await Campus.create({
      campusName,
      campusCode,
      location,
      address,
      contactEmail,
      contactNumber,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Campus created successfully',
      campus,
    });
  } catch (error) {
    console.error('Error creating campus:', error);
    return NextResponse.json(
      { error: 'Failed to create campus' },
      { status: 500 }
    );
  }
}

// PUT - Update campus
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { campusId, updates } = body;
    
    if (!campusId) {
      return NextResponse.json(
        { error: 'Campus ID is required' },
        { status: 400 }
      );
    }
    
    const campus = await Campus.findByIdAndUpdate(
      campusId,
      { $set: updates },
      { new: true }
    );
    
    if (!campus) {
      return NextResponse.json(
        { error: 'Campus not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Campus updated successfully',
      campus,
    });
  } catch (error) {
    console.error('Error updating campus:', error);
    return NextResponse.json(
      { error: 'Failed to update campus' },
      { status: 500 }
    );
  }
}

// DELETE - Delete campus
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get('id');
    
    if (!campusId) {
      return NextResponse.json(
        { error: 'Campus ID is required' },
        { status: 400 }
      );
    }
    
    const campus = await Campus.findByIdAndDelete(campusId);
    
    if (!campus) {
      return NextResponse.json(
        { error: 'Campus not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Campus deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting campus:', error);
    return NextResponse.json(
      { error: 'Failed to delete campus' },
      { status: 500 }
    );
  }
}
