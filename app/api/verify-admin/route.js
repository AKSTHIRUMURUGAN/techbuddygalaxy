import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin-session');
    
    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false, error: 'No session found' },
        { status: 401 }
      );
    }

    // Verify session token (simple check - in production, use proper JWT verification)
    try {
      const decoded = Buffer.from(sessionToken.value, 'base64').toString();
      const [username, timestamp] = decoded.split(':');
      
      // Check if session is expired (24 hours)
      const sessionAge = Date.now() - parseInt(timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > maxAge) {
        return NextResponse.json(
          { authenticated: false, error: 'Session expired' },
          { status: 401 }
        );
      }
      
      return NextResponse.json({
        authenticated: true,
        username
      });
    } catch (error) {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid session' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}