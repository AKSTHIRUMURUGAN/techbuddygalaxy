import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

    const applicationsDir = path.join(process.cwd(), 'applications');
    
    // Check if applications directory exists
    if (!fs.existsSync(applicationsDir)) {
      return NextResponse.json({
        success: true,
        applications: [],
        message: 'No applications directory found'
      });
    }

    // Read all application files
    const files = fs.readdirSync(applicationsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const applications = [];
    
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(applicationsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const application = JSON.parse(fileContent);
        applications.push(application);
      } catch (error) {
        console.error(`Error reading application file ${file}:`, error);
      }
    }

    // Sort applications by submission date (newest first)
    applications.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    return NextResponse.json({
      success: true,
      applications,
      count: applications.length
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error.message },
      { status: 500 }
    );
  }
}