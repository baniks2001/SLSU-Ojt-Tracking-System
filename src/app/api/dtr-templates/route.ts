import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { DTRTemplate } from '@/lib/models';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

// Allowed file types
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// GET - Fetch DTR templates
export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    
    let query: any = {};
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    const templates = await DTRTemplate.find(query)
      .sort({ createdAt: -1 })
      .select('-__v');
    
    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error('Error fetching DTR templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DTR templates' },
      { status: 500 }
    );
  }
}

// POST - Upload DTR template
export async function POST(request: Request) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const templateName = formData.get('templateName') as string;
    const description = formData.get('description') as string;
    
    if (!file || !templateName) {
      return NextResponse.json(
        { error: 'File and template name are required' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPEG, and PNG are allowed.' },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'dtr-templates');
    await mkdir(uploadDir, { recursive: true });
    
    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;
    const filepath = join(uploadDir, filename);
    
    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);
    
    // Save to database
    const template = await DTRTemplate.create({
      templateName,
      description,
      fileName: filename,
      originalName: file.name,
      fileType: file.type,
      fileSize: file.size,
      filePath: `/uploads/dtr-templates/${filename}`,
      isActive: true,
    });
    
    return NextResponse.json({
      success: true,
      message: 'DTR template uploaded successfully',
      template,
    });
  } catch (error) {
    console.error('Error uploading DTR template:', error);
    return NextResponse.json(
      { error: 'Failed to upload DTR template' },
      { status: 500 }
    );
  }
}

// PUT - Update template status
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { templateId, updates } = body;
    
    const template = await DTRTemplate.findByIdAndUpdate(
      templateId,
      { $set: updates },
      { new: true }
    );
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Template updated successfully',
      template,
    });
  } catch (error) {
    console.error('Error updating DTR template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE - Delete template
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }
    
    const template = await DTRTemplate.findByIdAndDelete(templateId);
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting DTR template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
