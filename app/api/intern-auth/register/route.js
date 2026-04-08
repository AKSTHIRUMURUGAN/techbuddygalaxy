import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/models';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password, name, department, phone } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection(Collections.USERS);

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      name,
      role: 'intern',
      department: department || 'General',
      phone: phone || '',
      joinDate: new Date(),
      profileImage: null,
      skills: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create initial performance record
    const performanceCollection = await getCollection(Collections.PERFORMANCE);
    await performanceCollection.insertOne({
      userId: result.insertedId.toString(),
      performanceScore: 0,
      speedScore: 0,
      qualityScore: 0,
      consistencyScore: 0,
      attendanceScore: 0,
      avgQuality: 0,
      onTimeRate: 0,
      attendanceRate: 0,
      tasksCompleted: 0,
      tasksOnTime: 0,
      totalTasks: 0,
      avgCompletionTime: 0,
      lastCalculated: new Date(),
      monthlyScores: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      userId: result.insertedId.toString(),
      message: 'Registration successful! You can now login.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
