import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StartupStarterTeam from '@/models/StartupStarterTeam';
import StartupStarterRegistration from '@/models/StartupStarterRegistration';

export async function POST(request) {
  try {
    await dbConnect();

    const { 
      teamId,
      problemScore,
      solutionScore,
      businessModelScore,
      pitchScore,
      innovationScore,
      adminComments,
      evaluatedBy
    } = await request.json();

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Calculate total score
    const totalScore = (
      (parseFloat(problemScore) || 0) +
      (parseFloat(solutionScore) || 0) +
      (parseFloat(businessModelScore) || 0) +
      (parseFloat(pitchScore) || 0) +
      (parseFloat(innovationScore) || 0)
    );

    // Find or create team document
    let team = await StartupStarterTeam.findOne({ teamId });

    if (!team) {
      // Get team number from registration
      const registration = await StartupStarterRegistration.findOne({ teamId });
      
      if (!registration) {
        return NextResponse.json(
          { error: 'Team not found in registrations' },
          { status: 404 }
        );
      }

      // Create team document
      team = await StartupStarterTeam.create({
        teamId,
        teamNumber: registration.teamNumber,
        teamName: null,
        startupName: null
      });
    }

    // Update evaluation
    team.evaluation = {
      problemScore: parseFloat(problemScore) || 0,
      solutionScore: parseFloat(solutionScore) || 0,
      businessModelScore: parseFloat(businessModelScore) || 0,
      pitchScore: parseFloat(pitchScore) || 0,
      innovationScore: parseFloat(innovationScore) || 0,
      totalScore,
      adminComments: adminComments || null,
      evaluatedBy: evaluatedBy || 'Admin',
      evaluatedAt: new Date()
    };

    await team.save();

    return NextResponse.json({
      success: true,
      message: 'Evaluation saved successfully',
      evaluation: team.evaluation
    });
  } catch (error) {
    console.error('Error saving evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to save evaluation' },
      { status: 500 }
    );
  }
}

// Publish/unpublish results
export async function PATCH(request) {
  try {
    await dbConnect();

    const { teamId, publish } = await request.json();

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    const team = await StartupStarterTeam.findOne({ teamId });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    team.resultsPublished = publish;
    await team.save();

    return NextResponse.json({
      success: true,
      message: publish ? 'Results published' : 'Results unpublished',
      resultsPublished: team.resultsPublished
    });
  } catch (error) {
    console.error('Error publishing results:', error);
    return NextResponse.json(
      { error: 'Failed to update results status' },
      { status: 500 }
    );
  }
}
