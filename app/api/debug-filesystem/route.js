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
    const [, timestamp] = decoded.split(':');
    
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
    const debugInfo = {
      environment: process.env.NODE_ENV,
      platform: process.platform,
      cwd: process.cwd(),
      applicationsDir,
      checks: {}
    };

    // Check if applications directory exists
    try {
      debugInfo.checks.directoryExists = fs.existsSync(applicationsDir);
    } catch (error) {
      debugInfo.checks.directoryExists = false;
      debugInfo.checks.directoryError = error.message;
    }

    // Try to read directory contents
    if (debugInfo.checks.directoryExists) {
      try {
        const files = fs.readdirSync(applicationsDir);
        debugInfo.checks.fileCount = files.length;
        debugInfo.checks.files = files.slice(0, 10); // Show first 10 files
      } catch (error) {
        debugInfo.checks.readError = error.message;
      }
    }

    // Test write permissions
    try {
      const testFile = path.join(applicationsDir, 'test-write.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      debugInfo.checks.canWrite = true;
    } catch (error) {
      debugInfo.checks.canWrite = false;
      debugInfo.checks.writeError = error.message;
      debugInfo.checks.writeErrorCode = error.code;
    }

    // Check if we can create directories
    try {
      const testDir = path.join(process.cwd(), 'test-dir');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
        fs.rmdirSync(testDir);
      }
      debugInfo.checks.canCreateDir = true;
    } catch (error) {
      debugInfo.checks.canCreateDir = false;
      debugInfo.checks.createDirError = error.message;
      debugInfo.checks.createDirErrorCode = error.code;
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo
    });

  } catch (error) {
    console.error('Error in filesystem debug:', error);
    return NextResponse.json(
      { error: 'Debug check failed', details: error.message },
      { status: 500 }
    );
  }
}