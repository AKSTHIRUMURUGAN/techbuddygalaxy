import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { R2Storage } from '../../../../lib/r2-storage';
import fs from 'fs';
import path from 'path';

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

export async function GET(_, { params }) {
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

    // Read application data
    const applicationData = JSON.parse(fs.readFileSync(applicationFile, 'utf8'));
    
    if (!applicationData.resumeFileName) {
      return NextResponse.json(
        { error: 'No resume found for this application' },
        { status: 404 }
      );
    }

    let resumeBuffer;
    let contentType = 'application/octet-stream';

    try {
      // Try to download from R2 first if resumeUrl exists
      if (applicationData.resumeUrl && R2Storage.isAvailable()) {
        try {
          const resumeStream = await R2Storage.downloadFile(applicationData.resumeFileName);
          const chunks = [];
          
          for await (const chunk of resumeStream) {
            chunks.push(chunk);
          }
          
          resumeBuffer = Buffer.concat(chunks);
          console.log('Resume downloaded from R2');
        } catch (r2Error) {
          console.warn('R2 download failed, trying local storage:', r2Error.message);
          resumeBuffer = null;
        }
      }

      // Fallback to local storage if R2 failed or not available
      if (!resumeBuffer) {
        const resumePath = path.join(applicationsDir, applicationData.resumeFileName);
        
        if (!fs.existsSync(resumePath)) {
          return NextResponse.json(
            { error: 'Resume file not found' },
            { status: 404 }
          );
        }

        resumeBuffer = fs.readFileSync(resumePath);
        console.log('Resume loaded from local storage');
      }

      // Determine content type based on file extension
      const fileExtension = path.extname(applicationData.resumeFileName).toLowerCase();
      
      if (fileExtension === '.pdf') {
        contentType = 'application/pdf';
      } else if (fileExtension === '.doc') {
        contentType = 'application/msword';
      } else if (fileExtension === '.docx') {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }

      // Return the resume file
      return new NextResponse(resumeBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${applicationData.resumeOriginalName || applicationData.resumeFileName}"`,
          'Content-Length': resumeBuffer.length.toString(),
        },
      });

    } catch (error) {
      console.error('Error retrieving resume:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve resume file' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error downloading resume:', error);
    return NextResponse.json(
      { error: 'Failed to download resume', details: error.message },
      { status: 500 }
    );
  }
}