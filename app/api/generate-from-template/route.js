import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

    const { templateUrl, data, applicationId, templateType } = await request.json();
    
    if (!templateUrl || !data || !applicationId) {
      return NextResponse.json(
        { error: 'Template URL, data, and application ID are required' },
        { status: 400 }
      );
    }

    // Use the existing dynamic template generation API
    const generateResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-from-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateUrl,
        data
      }),
    });

    if (!generateResponse.ok) {
      const errorData = await generateResponse.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to generate document' },
        { status: 500 }
      );
    }

    const generateResult = await generateResponse.json();

    // Generate PDF version
    const pdfResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-from-url-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateUrl,
        data
      }),
    });

    let pdfUrl = null;
    if (pdfResponse.ok) {
      const pdfResult = await pdfResponse.json();
      pdfUrl = pdfResult.downloadUrl;
    }

    return NextResponse.json({
      success: true,
      documentUrl: generateResult.downloadUrl,
      pdfUrl: pdfUrl,
      templateType: templateType,
      applicationId: applicationId
    });

  } catch (error) {
    console.error('Error generating document from template:', error);
    return NextResponse.json(
      { error: 'Failed to generate document from template' },
      { status: 500 }
    );
  }
}