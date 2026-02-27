import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { DTRTemplate, Student } from '@/lib/models';

// POST - Process DTR template with OCR
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { templateId, studentId } = body;
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }
    
    const template = await DTRTemplate.findById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    // Get student info if studentId provided
    let studentInfo = null;
    if (studentId) {
      const student = await Student.findById(studentId)
        .populate('userId', 'email')
        .populate('courseId', 'courseName')
        .populate('departmentId', 'departmentName');
      if (student) {
        studentInfo = {
          name: `${student.firstName} ${student.lastName}`,
          studentId: student.studentId,
          course: (student.courseId as any)?.courseName,
          department: (student.departmentId as any)?.departmentName,
        };
      }
    }
    
    // Perform OCR simulation (in production, use Tesseract.js or cloud OCR)
    // This extracts data from the template based on the Civil Service Form No. 48 format
    const extractedData = await performOCRExtraction(template, studentInfo);
    
    // Update template with extracted data
    template.extractedData = extractedData;
    await template.save();
    
    return NextResponse.json({
      success: true,
      message: 'DTR template processed successfully',
      extractedData,
      studentInfo,
    });
  } catch (error) {
    console.error('Error processing DTR template:', error);
    return NextResponse.json(
      { error: 'Failed to process DTR template' },
      { status: 500 }
    );
  }
}

// Simulate OCR extraction based on Civil Service Form No. 48 format
async function performOCRExtraction(template: any, studentInfo: any) {
  // In production, this would use actual OCR (Tesseract.js, AWS Textract, Google Vision API, etc.)
  // For now, we'll simulate based on the expected format
  
  const now = new Date();
  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];
  
  // Generate sample data matching the Civil Service Form No. 48 format
  const days = [];
  for (let i = 1; i <= 31; i++) {
    const dayData: any = { day: i };
    
    // Weekends have no entries
    const date = new Date(now.getFullYear(), now.getMonth(), i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    
    if (!isWeekend) {
      // Sample work hours (8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM)
      dayData.amArrival = '8:03';
      dayData.amDeparture = '12:03';
      dayData.pmArrival = '1:00';
      dayData.pmDeparture = '5:00';
    }
    
    days.push(dayData);
  }
  
  return {
    name: studentInfo?.name || 'EXTRACTED NAME',
    month: monthNames[now.getMonth()],
    year: now.getFullYear().toString(),
    days,
  };
}

// GET - Get processed DTR data
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }
    
    const template = await DTRTemplate.findById(templateId).select('extractedData');
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      extractedData: template.extractedData,
    });
  } catch (error) {
    console.error('Error fetching DTR data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DTR data' },
      { status: 500 }
    );
  }
}
