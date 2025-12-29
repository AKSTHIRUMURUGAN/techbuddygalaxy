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
    const applicationFile = path.join(applicationsDir, `${applicationId}.json`);
    
    if (!fs.existsSync(applicationFile)) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Read current application data
    const applicationData = JSON.parse(fs.readFileSync(applicationFile, 'utf8'));
    
    // Update status
    applicationData.status = status;
    applicationData.statusMessage = message || '';
    applicationData.statusUpdatedAt = new Date().toISOString();
    
    // Save updated application
    fs.writeFileSync(applicationFile, JSON.stringify(applicationData, null, 2));

    // Send email notification based on status
    try {
      if (status === 'approved') {
        await EmailService.sendApprovalEmail(applicationData);
      } else if (status === 'rejected') {
        await EmailService.sendRejectionEmail(applicationData, message);
      }
    } catch (error) {
      console.warn('Failed to send status email:', error.message);
    }

    return NextResponse.json({
      success: true,
      message: `Application ${status} successfully`,
      applicationId
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}