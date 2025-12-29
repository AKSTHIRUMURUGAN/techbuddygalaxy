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

    const { templateId, templateUrl, fieldMappings } = await request.json();
    
    if (!templateId || !templateUrl || !fieldMappings) {
      return NextResponse.json(
        { error: 'Template ID, URL, and field mappings are required' },
        { status: 400 }
      );
    }

    // Create admin-data directory if it doesn't exist
    const mappingsDir = path.join(process.cwd(), 'admin-data');
    if (!fs.existsSync(mappingsDir)) {
      fs.mkdirSync(mappingsDir, { recursive: true });
    }

    // Load existing mappings
    const mappingsFile = path.join(mappingsDir, 'template-mappings.json');
    let existingMappings = {};
    
    if (fs.existsSync(mappingsFile)) {
      try {
        const mappingsData = fs.readFileSync(mappingsFile, 'utf8');
        existingMappings = JSON.parse(mappingsData);
      } catch (error) {
        console.warn('Could not parse existing mappings:', error.message);
      }
    }

    // Save or update mapping for this template
    existingMappings[templateId] = {
      templateId,
      templateUrl,
      fieldMappings,
      updatedAt: new Date().toISOString()
    };

    // Save updated mappings
    fs.writeFileSync(mappingsFile, JSON.stringify(existingMappings, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Template mapping saved successfully'
    });

  } catch (error) {
    console.error('Error saving template mapping:', error);
    return NextResponse.json(
      { error: 'Failed to save template mapping' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Verify admin authentication
    const isAuthenticated = await verifyAdminSession();
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    
    // Load existing mappings
    const mappingsDir = path.join(process.cwd(), 'admin-data');
    const mappingsFile = path.join(mappingsDir, 'template-mappings.json');
    let existingMappings = {};
    
    if (fs.existsSync(mappingsFile)) {
      try {
        const mappingsData = fs.readFileSync(mappingsFile, 'utf8');
        existingMappings = JSON.parse(mappingsData);
      } catch (error) {
        console.warn('Could not parse existing mappings:', error.message);
      }
    }

    if (templateId) {
      // Return mapping for specific template
      const mapping = existingMappings[templateId] || null;
      return NextResponse.json({
        success: true,
        mapping
      });
    } else {
      // Return all mappings
      return NextResponse.json({
        success: true,
        mappings: existingMappings
      });
    }

  } catch (error) {
    console.error('Error fetching template mapping:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template mapping' },
      { status: 500 }
    );
  }
}