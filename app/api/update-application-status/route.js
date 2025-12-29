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

    // Get application from MongoDB
    const applicationsCollection = await getCollection('applications');
    const application = await applicationsCollection.findOne({ applicationId });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Update application status in MongoDB
    const updateResult = await applicationsCollection.updateOne(
      { applicationId },
      {
        $set: {
          status,
          statusMessage: message || '',
          statusUpdatedAt: new Date()
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update application status' },
        { status: 500 }
      );
    }

    // Get updated application data for email
    const updatedApplication = await applicationsCollection.findOne({ applicationId });

    // Send email notification based on status
    try {
      if (status === 'approved') {
        await EmailService.sendApprovalEmail(updatedApplication);
      } else if (status === 'rejected') {
        await EmailService.sendRejectionEmail(updatedApplication, message);
      }
    } catch (emailError) {
      console.warn('Failed to send status email:', emailError.message);
      // Don't fail the entire operation if email fails
    }

    console.log('Application status updated in MongoDB:', applicationId, status);

    return NextResponse.json({
      success: true,
      message: `Application ${status} successfully`,
      applicationId
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update application status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}