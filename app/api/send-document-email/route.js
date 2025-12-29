import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCollection } from '../../../lib/mongodb';
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

    // Connect to MongoDB
    let applicationsCollection;
    try {
      applicationsCollection = await getCollection('applications');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Find the application
    const applicationData = await applicationsCollection.findOne({ applicationId });
    
    if (!applicationData) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Send document email
    try {
      // Use the provided documentUrl which is the fresh R2 link
      await EmailService.sendDocumentEmail(applicationData, documentType, documentUrl, templateTitle);
      
      // Create document entry
      const documentEntry = {
        type: documentType,
        title: templateTitle,
        url: documentUrl,
        sentAt: new Date().toISOString()
      };
      
      // Update application with document info in MongoDB
      await applicationsCollection.updateOne(
        { applicationId },
        { 
          $push: { documents: documentEntry }
        }
      );

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
