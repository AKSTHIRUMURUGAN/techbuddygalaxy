import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StartupStarterRegistration from '@/models/StartupStarterRegistration';

export async function POST(request) {
  try {
    // Simple authentication - you can enhance this with proper auth
    // For now, allowing access to admin endpoints
    
    await dbConnect();

    const { ticketId, scanType } = await request.json();

    // Find registration
    const registration = await StartupStarterRegistration.findOne({ ticketId });

    if (!registration) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
        { status: 404 }
      );
    }

    // Update based on scan type
    const updateData = {};
    let message = '';

    switch (scanType) {
      case 'entry':
        if (registration.entryVerified) {
          return NextResponse.json(
            { error: 'Entry already verified' },
            { status: 400 }
          );
        }
        updateData.entryVerified = true;
        updateData.entryVerifiedAt = new Date();
        message = `Entry verified for ${registration.name}`;
        break;

      case 'morning':
        if (!registration.entryVerified) {
          return NextResponse.json(
            { error: 'Entry not verified yet' },
            { status: 400 }
          );
        }
        if (registration.morningAttendance) {
          return NextResponse.json(
            { error: 'Morning attendance already marked' },
            { status: 400 }
          );
        }
        updateData.morningAttendance = new Date();
        message = `Morning attendance marked for ${registration.name}`;
        break;

      case 'evening':
        if (!registration.entryVerified) {
          return NextResponse.json(
            { error: 'Entry not verified yet' },
            { status: 400 }
          );
        }
        if (registration.eveningAttendance) {
          return NextResponse.json(
            { error: 'Evening attendance already marked' },
            { status: 400 }
          );
        }
        updateData.eveningAttendance = new Date();
        message = `Evening attendance marked for ${registration.name}`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid scan type' },
          { status: 400 }
        );
    }

    // Update registration
    await StartupStarterRegistration.findOneAndUpdate(
      { ticketId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return NextResponse.json({
      success: true,
      message,
      registration: {
        name: registration.name,
        rollNo: registration.rollNo,
        department: registration.department
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
