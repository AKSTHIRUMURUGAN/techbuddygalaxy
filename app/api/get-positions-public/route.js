import { NextResponse } from 'next/server';
import { getCollection } from '../../../lib/mongodb';

export async function GET() {
  try {
    // Load positions from MongoDB only (no default positions)
    let positions = [];
    try {
      const positionsCollection = await getCollection('positions');
      positions = await positionsCollection.find({}).toArray();
      
      // Convert MongoDB _id to string and ensure proper date formatting
      positions = positions.map(position => ({
        ...position,
        _id: position._id.toString(),
        id: position._id.toString(),
        createdAt: position.createdAt instanceof Date ? position.createdAt.toISOString() : position.createdAt
      }));
      
      console.log(`Loaded ${positions.length} positions from MongoDB`);
    } catch (dbError) {
      console.error('Error loading positions from MongoDB:', dbError);
      return NextResponse.json(
        { error: 'Failed to load positions from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      positions: positions
    });

  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}