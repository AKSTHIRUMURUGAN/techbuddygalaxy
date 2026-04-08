import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/models';
import { ObjectId } from 'mongodb';

export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, name, phone, department, skills } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection(Collections.USERS);

    const updateData = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (department) updateData.department = department;
    if (skills) updateData.skills = skills;

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
