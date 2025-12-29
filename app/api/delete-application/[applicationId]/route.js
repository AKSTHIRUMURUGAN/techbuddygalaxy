import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { R2Storage } from '../../../../lib/r2-storage';

// Helper function to verify admin session
async function verifyAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin-session');
  
  if (!sessionToken) {
    return false;
  }

  try {
    const decoded = Buffer.from(sessionToken.value, 'base64').toString();
    const [username, timestamp] = decoded.split(':');
    
    // Check if session is expired (24 hours)
    const sessionAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return sessionAge <= maxAge;
  } catch (error) {
    return false;
  }
}

export async function DELETE(request, { params }) {
  try {
    // Verify admin authentication
    const isAuthenticated = await verifyAdminSession();
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { applicationId } = await params;
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Find the application file
    const applicationsDir = path.join(process.cwd(), 'applications');
    const applicationFile = path.join(applicationsDir, `${applicationId}.json`);
    
    if (!fs.existsSync(applicationFile)) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Read application data to get resume info
    let applicationData;
    try {
      applicationData = JSON.parse(fs.readFileSync(applicationFile, 'utf8'));
    } catch (error) {
      console.error('Error reading application file:', error);
      return NextResponse.json(
        { error: 'Failed to read application data' },
        { status: 500 }
      );
    }

    // Delete resume file if it exists
    if (applicationData.resumeFileName) {
      try {
        // Try to delete from R2 first if resumeUrl exists
        if (applicationData.resumeUrl && R2Storage.isAvailable()) {
          try {
            // Note: R2Storage doesn't have a delete method in the current implementation
            // You might want to add one or handle this differently
            console.log('Resume stored in R2, manual cleanup may be required');
          } catch (r2Error) {
            console.warn('Could not delete resume from R2:', r2Error.message);
          }
        }

        // Delete local resume file if it exists
        const resumePath = path.join(applicationsDir, applicationData.resumeFileName);
        if (fs.existsSync(resumePath)) {
          fs.unlinkSync(resumePath);
          console.log('Local resume file deleted');
        }
      } catch (error) {
        console.warn('Could not delete resume file:', error.message);
        // Continue with application deletion even if resume deletion fails
      }
    }

    // Delete the application file
    try {
      fs.unlinkSync(applicationFile);
    } catch (error) {
      console.error('Error deleting application file:', error);
      return NextResponse.json(
        { error: 'Failed to delete application file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
      applicationId: applicationId
    });

  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application', details: error.message },
      { status: 500 }
    );
  }
}