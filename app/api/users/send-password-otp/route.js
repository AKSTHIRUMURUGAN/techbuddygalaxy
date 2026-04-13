import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/models';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import EmailService from '@/lib/email';
import passwordOtpStore from '@/lib/passwordOtpStore';

export async function POST(request) {
  try {
    const { userId, currentPassword } = await request.json();

    if (!userId || !currentPassword) {
      return NextResponse.json(
        { success: false, error: 'User ID and current password are required' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection(Collections.USERS);
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiry (5 minutes)
    passwordOtpStore.set(userId, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Send OTP via email
    await EmailService.sendPasswordOTP({
      name: user.name,
      email: user.email,
      otp,
    });

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
