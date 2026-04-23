import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StartupStarterRegistration from '@/models/StartupStarterRegistration';

export async function GET(request) {
  try {
    // Simple authentication - you can enhance this with proper auth
    // For now, allowing access to admin endpoints
    
    await dbConnect();

    const registrations = await StartupStarterRegistration.find({})
      .sort({ registeredAt: -1 })
      .lean();

    // Convert MongoDB ObjectIds and Dates to strings for JSON serialization
    const serializedRegistrations = registrations.map(reg => ({
      ...reg,
      _id: reg._id.toString(),
      registeredAt: reg.registeredAt?.toISOString() || null,
      entryVerifiedAt: reg.entryVerifiedAt?.toISOString() || null,
      morningAttendance: reg.morningAttendance?.toISOString() || null,
      eveningAttendance: reg.eveningAttendance?.toISOString() || null,
      createdAt: reg.createdAt?.toISOString() || null,
      updatedAt: reg.updatedAt?.toISOString() || null
    }));

    return NextResponse.json(serializedRegistrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
