import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StartupStarterRegistration from '@/models/StartupStarterRegistration';

export async function GET(request) {
  try {
    await dbConnect();

    const registrations = await StartupStarterRegistration.find({})
      .sort({ registeredAt: -1 });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();

    // Delete all registrations
    const result = await StartupStarterRegistration.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} registrations`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting all registrations:', error);
    return NextResponse.json(
      { error: 'Failed to delete all registrations' },
      { status: 500 }
    );
  }
}
