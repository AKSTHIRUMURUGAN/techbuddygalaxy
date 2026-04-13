import { NextResponse } from 'next/server';
import passwordOtpStore from '@/lib/passwordOtpStore';

export async function POST(request) {
  try {
    const { userId, otp } = await request.json();

    if (!userId || !otp) {
      return NextResponse.json(
        { success: false, error: 'User ID and OTP are required' },
        { status: 400 }
      );
    }

    const storedData = passwordOtpStore.get(userId);

    if (!storedData) {
      return NextResponse.json(
        { success: false, error: 'OTP not found or expired' },
        { status: 400 }
      );
    }

    if (Date.now() > storedData.expiresAt) {
      passwordOtpStore.delete(userId);
      return NextResponse.json(
        { success: false, error: 'OTP has expired' },
        { status: 400 }
      );
    }

    if (storedData.otp !== otp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    passwordOtpStore.set(userId, {
      ...storedData,
      verified: true,
    });

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
