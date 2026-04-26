import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StartupStarterRegistration from '@/models/StartupStarterRegistration';

export async function POST(request) {
  try {
    await dbConnect();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find the registration with this email
    const registration = await StartupStarterRegistration.findOne({ 
      email: normalizedEmail 
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Email not found in registrations' },
        { status: 404 }
      );
    }

    if (!registration.teamId) {
      return NextResponse.json(
        { error: 'You are not assigned to any team yet' },
        { status: 400 }
      );
    }

    // Get all team members
    const teamMembers = await StartupStarterRegistration.find({
      teamId: registration.teamId
    }).select('name email department');

    return NextResponse.json({
      success: true,
      team: {
        teamId: registration.teamId,
        teamNumber: registration.teamNumber,
        teamName: null, // Will be populated from StartupStarterTeam if needed
        startupName: null,
        members: teamMembers
      }
    });
  } catch (error) {
    console.error('Error verifying team member:', error);
    return NextResponse.json(
      { error: 'Failed to verify team member' },
      { status: 500 }
    );
  }
}
