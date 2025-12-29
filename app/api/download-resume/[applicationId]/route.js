import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCollection } from '../../../../lib/mongodb';
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

    // Get application data from MongoDB
    const applicationsCollection = await getCollection('applications');
    const application = await applicationsCollection.findOne({ applicationId });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    if (!application.resumeFileName) {
      return NextResponse.json(
        { error: 'No resume found for this application' },
        { status: 404 }
      );
    }

    // Check if R2 storage is available
    if (!R2Storage.isAvailable()) {
      return NextResponse.json(
        { error: 'Cloud storage not available' },
        { status: 500 }
      );
    }

    try {
      // Download resume from R2
      const resumeStream = await R2Storage.downloadFile(application.resumeFileName);
      const chunks = [];
      
      for await (const chunk of resumeStream) {
        chunks.push(chunk);
      }
      
      const resumeBuffer = Buffer.concat(chunks);

      // Determine content type based on stored type or file extension
      let contentType = application.resumeType || 'application/octet-stream';
      
      if (!application.resumeType) {
        const fileExtension = application.resumeFileName.split('.').pop().toLowerCase();
        
        if (fileExtension === 'pdf') {
          contentType = 'application/pdf';
        } else if (fileExtension === 'doc') {
          contentType = 'application/msword';
        } else if (fileExtension === 'docx') {
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
      }

      // Return the resume file
      return new NextResponse(resumeBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${application.resumeOriginalName || application.resumeFileName}"`,
          'Content-Length': resumeBuffer.length.toString(),
        },
      });

    } catch (error) {
      console.error('Error downloading resume from R2:', error);
      return NextResponse.json(
        { error: 'Failed to download resume from cloud storage' },
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