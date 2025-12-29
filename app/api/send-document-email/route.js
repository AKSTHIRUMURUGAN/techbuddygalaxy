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
    const [username, timestamp] = decoded.split(':');
    
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

    const { applicationId, documentType, documentUrl, templateTitle } = await request.json();
    
    if (!applicationId || !documentType || !documentUrl) {
      return NextResponse.json(
        { error: 'Application ID, document type, and document URL are required' },
        { status: 400 }
      );
    }

    // Find the application
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

    // Send document email
    try {
      await EmailService.sendDocumentEmail(applicationData, documentType, documentUrl, templateTitle);
      
      // Update application with document info
      if (!applicationData.documents) {
        applicationData.documents = [];
      }
      
      applicationData.documents.push({
        type: documentType,
        title: templateTitle,
        url: documentUrl,
        sentAt: new Date().toISOString()
      });
      
      // Save updated application
      fs.writeFileSync(applicationFile, JSON.stringify(applicationData, null, 2));

      return NextResponse.json({
        success: true,
        message: 'Document sent successfully'
      });

    } catch (error) {
      console.error('Error sending document email:', error);
      return NextResponse.json(
        { error: 'Failed to send document email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in send document email API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}