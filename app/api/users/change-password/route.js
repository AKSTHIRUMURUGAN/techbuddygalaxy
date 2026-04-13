import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/models';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import passwordOtpStore from '@/lib/passwordOtpStore';

export async function POST(request) {
  try {
    const { userId, otp, newPassword } = await request.json();

    if (!userId || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const storedData = passwordOtpStore.get(userId);

    if (!storedData || !storedData.verified) {
      return NextResponse.json(
        { success: false, error: 'OTP not verified' },
        { status: 400 }
      );
    }

    if (storedData.otp !== otp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const usersCollection = await getCollection(Collections.USERS);
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Clear OTP from store
    passwordOtpStore.delete(userId);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
