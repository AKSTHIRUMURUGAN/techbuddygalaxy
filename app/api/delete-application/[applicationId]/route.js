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

    // Get application from MongoDB to check if it exists and get resume info
    const applicationsCollection = await getCollection('applications');
    const application = await applicationsCollection.findOne({ applicationId });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Delete resume from R2 if it exists
    if (application.resumeFileName && R2Storage.isAvailable()) {
      try {
        await R2Storage.deleteFile(application.resumeFileName);
        console.log('Resume deleted from R2:', application.resumeFileName);
      } catch (error) {
        console.warn('Could not delete resume from R2:', error.message);
        // Continue with application deletion even if resume deletion fails
      }
    }

    // Delete application from MongoDB
    const deleteResult = await applicationsCollection.deleteOne({ applicationId });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Application not found or already deleted' },
        { status: 404 }
      );
    }

    console.log('Application deleted from MongoDB:', applicationId);

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