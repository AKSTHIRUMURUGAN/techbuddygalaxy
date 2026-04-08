import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/models';
import bcrypt from 'bcryptjs';
import EmailService from '@/lib/email';

export async function POST(request) {
  try {
    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Get application data
    const applicationsCollection = await getCollection(Collections.APPLICATIONS);
    const application = await applicationsCollection.findOne({ applicationId });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if application is approved
    if (application.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Application must be approved first' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection(Collections.USERS);

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: application.email });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User account already exists for this email' },
        { status: 400 }
      );
    }

    // Generate a random password
    const generatedPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10).toUpperCase();

    // Hash password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create user account
    const result = await usersCollection.insertOne({
      email: application.email,
      password: hashedPassword,
      name: application.name,
      role: 'intern',
      department: application.department || 'General',
      phone: application.phone || '',
      applicationId: application.applicationId,
      joinDate: new Date(),
      profileImage: null,
      skills: application.skills ? application.skills.split(',').map(s => s.trim()) : [],
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

    // Update application to mark access as given
    await applicationsCollection.updateOne(
      { applicationId },
      { 
        $set: { 
          accessGiven: true,
          accessGivenAt: new Date(),
          userId: result.insertedId.toString()
        } 
      }
    );

    // Send login credentials via email
    await EmailService.sendLoginCredentials({
      name: application.name,
      email: application.email,
      password: generatedPassword,
    });

    return NextResponse.json({
      success: true,
      message: 'Intern account created and login credentials sent via email',
      userId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error giving intern access:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create intern account. Please try again.' },
      { status: 500 }
    );
  }
}
