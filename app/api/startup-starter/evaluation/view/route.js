import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StartupStarterRegistration from '@/models/StartupStarterRegistration';
import StartupStarterTeam from '@/models/StartupStarterTeam';

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

    // Find the user by email
    const user = await StartupStarterRegistration.findOne({ 
      email: email.toLowerCase() 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email not found in registrations' },
        { status: 404 }
      );
    }

    if (!user.teamId || !user.teamNumber) {
      return NextResponse.json(
        { error: 'You are not assigned to any team yet' },
        { status: 400 }
      );
    }

    // Find team details
    const team = await StartupStarterTeam.findOne({ teamId: user.teamId });

    if (!team) {
      return NextResponse.json(
        { error: 'Team details not found' },
        { status: 404 }
      );
    }

    // Check if results are published
    if (!team.resultsPublished) {
      return NextResponse.json({
        success: false,
        resultsPublished: false,
        message: 'Evaluation results have not been published yet'
      });
    }

    // Return evaluation if it exists
    if (!team.evaluation || !team.evaluation.evaluatedAt) {
      return NextResponse.json({
        success: false,
        resultsPublished: true,
        message: 'No evaluation found for your team'
      });
    }

    return NextResponse.json({
      success: true,
      resultsPublished: true,
      teamNumber: team.teamNumber,
      teamName: team.teamName,
      startupName: team.startupName,
      evaluation: team.evaluation
    });
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluation' },
      { status: 500 }
    );
  }
}
