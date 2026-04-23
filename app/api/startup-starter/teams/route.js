import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StartupStarterRegistration from '@/models/StartupStarterRegistration';
import StartupStarterTeam from '@/models/StartupStarterTeam';

// GET - Fetch all teams
export async function GET(request) {
  try {
    await dbConnect();

    const registrations = await StartupStarterRegistration.find({ teamId: { $ne: null } })
      .sort({ teamNumber: 1, name: 1 });

    // Get all team details
    const teamDetails = await StartupStarterTeam.find({});
    const teamDetailsMap = {};
    teamDetails.forEach(td => {
      teamDetailsMap[td.teamId] = {
        teamName: td.teamName,
        startupName: td.startupName,
        i2rMemberProfileUrls: td.i2rMemberProfileUrls,
        i2rIdeaProfileUrl: td.i2rIdeaProfileUrl,
        i2rCompanyProfileUrl: td.i2rCompanyProfileUrl,
        evaluation: td.evaluation,
        resultsPublished: td.resultsPublished
      };
    });

    // Group by team
    const teams = {};
    registrations.forEach(reg => {
      if (!teams[reg.teamNumber]) {
        const details = teamDetailsMap[reg.teamId] || {};
        teams[reg.teamNumber] = {
          teamNumber: reg.teamNumber,
          teamId: reg.teamId,
          teamName: details.teamName || null,
          startupName: details.startupName || null,
          i2rMemberProfileUrls: details.i2rMemberProfileUrls || null,
          i2rIdeaProfileUrl: details.i2rIdeaProfileUrl || null,
          i2rCompanyProfileUrl: details.i2rCompanyProfileUrl || null,
          evaluation: details.evaluation || null,
          resultsPublished: details.resultsPublished || false,
          members: []
        };
      }
      teams[reg.teamNumber].members.push({
        ticketId: reg.ticketId,
        name: reg.name,
        email: reg.email,
        rollNo: reg.rollNo,
        department: reg.department,
        phoneNo: reg.phoneNo
      });
    });

    const teamArray = Object.values(teams);

    return NextResponse.json({
      success: true,
      teams: teamArray,
      totalTeams: teamArray.length,
      totalMembers: registrations.length
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

// POST - Create teams
export async function POST(request) {
  try {
    await dbConnect();

    const { teamSize } = await request.json();

    if (!teamSize || teamSize < 1) {
      return NextResponse.json(
        { error: 'Invalid team size' },
        { status: 400 }
      );
    }

    // Get all verified participants (entry verified)
    const participants = await StartupStarterRegistration.find({ 
      entryVerified: true 
    });

    if (participants.length === 0) {
      return NextResponse.json(
        { error: 'No verified participants found' },
        { status: 400 }
      );
    }

    // Shuffle participants
    const shuffled = [...participants].sort(() => Math.random() - 0.5);

    // Create teams
    const teams = [];
    let currentTeam = [];
    let teamNumber = 1;

    for (let i = 0; i < shuffled.length; i++) {
      currentTeam.push(shuffled[i]);

      if (currentTeam.length === teamSize || i === shuffled.length - 1) {
        const teamId = `TEAM-${Date.now()}-${teamNumber}`;
        
        // Update all members in this team
        for (const member of currentTeam) {
          await StartupStarterRegistration.findByIdAndUpdate(
            member._id,
            { 
              teamId,
              teamNumber
            }
          );
        }

        // Create team document - delete any existing one first to avoid duplicate key errors
        await StartupStarterTeam.deleteOne({ teamNumber });
        await StartupStarterTeam.create({
          teamId,
          teamNumber,
          teamName: null,
          startupName: null
        });

        teams.push({
          teamNumber,
          teamId,
          memberCount: currentTeam.length
        });

        currentTeam = [];
        teamNumber++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${teams.length} teams`,
      teams,
      totalParticipants: shuffled.length
    });
  } catch (error) {
    console.error('Error creating teams:', error);
    return NextResponse.json(
      { error: 'Failed to create teams' },
      { status: 500 }
    );
  }
}

// DELETE - Clear all teams
export async function DELETE(request) {
  try {
    await dbConnect();

    // Reset all team assignments in registrations
    await StartupStarterRegistration.updateMany(
      {},
      { 
        $set: { 
          teamId: null,
          teamNumber: null
        }
      }
    );

    // Delete all team documents
    await StartupStarterTeam.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'All teams cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing teams:', error);
    return NextResponse.json(
      { error: 'Failed to clear teams' },
      { status: 500 }
    );
  }
}
