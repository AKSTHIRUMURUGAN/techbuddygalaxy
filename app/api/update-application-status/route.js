import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { EmailService } from '../../../lib/email';

// Helper function to verify admin session
async function verifyAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin-session');
  
  if (!sessionToken) {
    return false;
  }

  try {
    const decoded = Buffer.from(sessionToken.value, 'base64').toString();
    const [, timestamp] = decoded.split(':');
    
    // Check if session is expired (24 hours)
    const sessionAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return sessionAge <= maxAge;
  } catch (error) {
    return false;
  }
}

export async function POST(request) {
  try {
    // Verify admin authentication
    const isAuthenticated = await verifyAdminSession();
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { applicationId, status, message } = await request.json();
    
    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Application ID and status are required' },
        { status: 400 }
      );
    }

    // Find and update the application file
    const applicationsDir = path.join(process.cwd(), 'applications');
    
    // Check if applications directory exists
    if (!fs.existsSync(applicationsDir)) {
      console.error('Applications directory does not exist:', applicationsDir);
      return NextResponse.json(
        { error: 'Applications directory not found. This might be a production environment issue.' },
        { status: 500 }
      );
    }
    
    const applicationFile = path.join(applicationsDir, `${applicationId}.json`);
    
    if (!fs.existsSync(applicationFile)) {
      console.error('Application file not found:', applicationFile);
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Read current application data
    let applicationData;
    try {
      const fileContent = fs.readFileSync(applicationFile, 'utf8');
      applicationData = JSON.parse(fileContent);
    } catch (parseError) {
      console.error('Error parsing application file:', parseError);
      return NextResponse.json(
        { error: 'Invalid application data format' },
        { status: 500 }
      );
    }
    
    // Update status
    applicationData.status = status;
    applicationData.statusMessage = message || '';
    applicationData.statusUpdatedAt = new Date().toISOString();
    
    // Save updated application
    try {
      fs.writeFileSync(applicationFile, JSON.stringify(applicationData, null, 2));
    } catch (writeError) {
      console.error('Error writing application file:', writeError);
      return NextResponse.json(
        { error: 'Failed to save application update. File system may be read-only.' },
        { status: 500 }
      );
    }

    // Send email notification based on status
    try {
      if (status === 'approved') {
        await EmailService.sendApprovalEmail(applicationData);
      } else if (status === 'rejected') {
        await EmailService.sendRejectionEmail(applicationData, message);
      }
    } catch (emailError) {
      console.warn('Failed to send status email:', emailError.message);
      // Don't fail the entire operation if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Application ${status} successfully`,
      applicationId
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    
    // Provide more specific error information
    let errorMessage = 'Failed to update application status';
    if (error.code === 'ENOENT') {
      errorMessage = 'Application file or directory not found';
    } else if (error.code === 'EACCES') {
      errorMessage = 'Permission denied - file system may be read-only';
    } else if (error.code === 'EROFS') {
      errorMessage = 'Read-only file system - cannot update application';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}