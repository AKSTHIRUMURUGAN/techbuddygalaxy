import { NextResponse } from 'next/server';
import { R2Storage } from '../../../lib/r2-storage';

export async function GET() {
  try {
    const testResults = {
      r2Available: R2Storage.isAvailable(),
      environment: {
        hasAccountId: !!process.env.R2_ACCOUNT_ID,
        hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY,
        hasBucketName: !!process.env.R2_BUCKET,
        hasPublicUrl: !!process.env.R2_PUBLIC_URL,
      },
      config: {
        accountId: process.env.R2_ACCOUNT_ID ? 'Configured' : 'Missing',
        bucketName: process.env.R2_BUCKET ? 'Configured' : 'Missing',
        publicUrl: process.env.R2_PUBLIC_URL ? 'Configured' : 'Missing',
        endpoint: process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : 'Not configured',
      }
    };

    // Try a simple test if R2 is available
    if (R2Storage.isAvailable()) {
      try {
        // Test with a small buffer
        const testBuffer = Buffer.from('R2 connection test');
        const testKey = `test/connection-test-${Date.now()}.txt`;
        
        await R2Storage.uploadFile(testKey, testBuffer, 'text/plain');
        testResults.connectionTest = 'SUCCESS - R2 upload test passed';
      } catch (error) {
        testResults.connectionTest = `FAILED - ${error.message}`;
        testResults.connectionError = error.toString();
      }
    } else {
      testResults.connectionTest = 'SKIPPED - R2 not configured';
    }

    return NextResponse.json(testResults);
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error.message,
      r2Available: false
    }, { status: 500 });
  }
}