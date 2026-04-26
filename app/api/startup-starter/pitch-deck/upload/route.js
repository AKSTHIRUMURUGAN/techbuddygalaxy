import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StartupStarterRegistration from '@/models/StartupStarterRegistration';
import StartupStarterTeam from '@/models/StartupStarterTeam';
import { R2Storage } from '@/lib/r2-storage';

export async function POST(request) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const file = formData.get('file');
    const email = formData.get('email');
    const teamId = formData.get('teamId');

    if (!file || !email || !teamId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the user is part of the team
    const registration = await StartupStarterRegistration.findOne({
      email: email.toLowerCase().trim(),
      teamId
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Unauthorized: You are not a member of this team' },
        { status: 403 }
      );
    }

    // Check if R2 is available
    if (!R2Storage.isAvailable()) {
      return NextResponse.json(
        { error: 'File storage is not configured' },
        { status: 500 }
      );
    }

    // Generate unique key for R2
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const sanitizedTeamId = teamId.replace(/[^a-zA-Z0-9-]/g, '_');
    const key = `pitch-decks/${sanitizedTeamId}_${timestamp}.${fileExtension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to R2
    const fileUrl = await R2Storage.uploadFile(key, buffer, file.type);

    // Update team document with pitch deck info
    const team = await StartupStarterTeam.findOneAndUpdate(
      { teamId },
      {
        $set: {
          'pitchDeck.fileName': file.name,
          'pitchDeck.fileUrl': fileUrl,
          'pitchDeck.fileSize': file.size,
          'pitchDeck.uploadedBy': email,
          'pitchDeck.uploadedAt': new Date()
        }
      },
      { returnDocument: 'after', upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Pitch deck uploaded successfully',
      pitchDeck: {
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error uploading pitch deck:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload pitch deck' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve pitch deck info
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    const team = await StartupStarterTeam.findOne({ teamId });

    if (!team || !team.pitchDeck || !team.pitchDeck.fileUrl) {
      return NextResponse.json(
        { error: 'No pitch deck found for this team' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pitchDeck: team.pitchDeck
    });
  } catch (error) {
    console.error('Error fetching pitch deck:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pitch deck' },
      { status: 500 }
    );
  }
}
