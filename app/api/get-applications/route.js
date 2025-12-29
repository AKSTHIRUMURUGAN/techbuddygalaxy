import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCollection } from '../../../lib/mongodb';

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

export async function GET() {
  try {
    // Verify admin authentication
    const isAuthenticated = await verifyAdminSession();
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Get applications from MongoDB
    const applicationsCollection = await getCollection('applications');
    const applications = await applicationsCollection
      .find({})
      .sort({ submittedAt: -1 }) // Sort by submission date (newest first)
      .toArray();

    // Convert MongoDB _id to string and ensure proper date formatting
    const formattedApplications = applications.map(app => ({
      ...app,
      _id: app._id.toString(),
      submittedAt: app.submittedAt instanceof Date ? app.submittedAt.toISOString() : app.submittedAt
    }));

    return NextResponse.json({
      success: true,
      applications: formattedApplications,
      count: formattedApplications.length
    });

  } catch (error) {
    console.error('Error fetching applications from MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications from database', details: error.message },
      { status: 500 }
    );
  }
}