import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StartupStarterTeam from '@/models/StartupStarterTeam';

export async function POST(request) {
  try {
    await dbConnect();

    const { publish } = await request.json();

    // Update all teams' resultsPublished status
    const result = await StartupStarterTeam.updateMany(
      {},
      { $set: { resultsPublished: publish } }
    );

    return NextResponse.json({
      success: true,
      message: publish 
        ? `All results published successfully (${result.modifiedCount} teams)` 
        : `All results unpublished successfully (${result.modifiedCount} teams)`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error publishing all results:', error);
    return NextResponse.json(
      { error: 'Failed to update results status' },
      { status: 500 }
    );
  }
}
