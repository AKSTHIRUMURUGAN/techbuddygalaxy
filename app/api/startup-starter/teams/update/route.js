import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StartupStarterRegistration from '@/models/StartupStarterRegistration';
import StartupStarterTeam from '@/models/StartupStarterTeam';

export async function POST(request) {
  try {
    await dbConnect();

    const { 
      email, 
      teamName, 
      startupName,
      i2rMemberProfileUrls,
      i2rIdeaProfileUrl,
      i2rCompanyProfileUrl
    } = await request.json();

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

    // Find or create team document
    let team = await StartupStarterTeam.findOne({ teamId: user.teamId });

    if (!team) {
      team = await StartupStarterTeam.create({
        teamId: user.teamId,
        teamNumber: user.teamNumber,
        teamName: teamName || null,
        startupName: startupName || null,
        i2rMemberProfileUrls: i2rMemberProfileUrls || null,
        i2rIdeaProfileUrl: i2rIdeaProfileUrl || null,
        i2rCompanyProfileUrl: i2rCompanyProfileUrl || null
      });
    } else {
      // Update team details
      if (teamName !== undefined) team.teamName = teamName;
      if (startupName !== undefined) team.startupName = startupName;
      if (i2rMemberProfileUrls !== undefined) team.i2rMemberProfileUrls = i2rMemberProfileUrls;
      if (i2rIdeaProfileUrl !== undefined) team.i2rIdeaProfileUrl = i2rIdeaProfileUrl;
      if (i2rCompanyProfileUrl !== undefined) team.i2rCompanyProfileUrl = i2rCompanyProfileUrl;
      await team.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Team details updated successfully',
      team: {
        teamNumber: team.teamNumber,
        teamName: team.teamName,
        startupName: team.startupName,
        i2rMemberProfileUrls: team.i2rMemberProfileUrls,
        i2rIdeaProfileUrl: team.i2rIdeaProfileUrl,
        i2rCompanyProfileUrl: team.i2rCompanyProfileUrl
      }
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Failed to update team details' },
      { status: 500 }
    );
  }
}
