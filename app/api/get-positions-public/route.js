import { NextResponse } from 'next/server';
import { getCollection } from '../../../lib/mongodb';

export async function GET() {
  try {
    // Default positions
    const defaultPositions = [
      {
        id: 'intern',
        title: 'Intern',
        description: 'Internship position',
        isDefault: true
      },
      {
        id: 'sde-1',
        title: 'Software Development Engineer I',
        description: 'Entry level software engineer',
        isDefault: true
      },
      {
        id: 'sde-2',
        title: 'Software Development Engineer II',
        description: 'Mid level software engineer',
        isDefault: true
      },
      {
        id: 'frontend-dev',
        title: 'Frontend Developer',
        description: 'Frontend development position',
        isDefault: true
      },
      {
        id: 'backend-dev',
        title: 'Backend Developer',
        description: 'Backend development position',
        isDefault: true
      },
      {
        id: 'fullstack-dev',
        title: 'Full Stack Developer',
        description: 'Full stack development position',
        isDefault: true
      }
    ];

    // Load custom positions from MongoDB
    let customPositions = [];
    try {
      const positionsCollection = await getCollection('positions');
      customPositions = await positionsCollection.find({}).toArray();
      
      // Convert MongoDB _id to string and ensure proper date formatting
      customPositions = customPositions.map(position => ({
        ...position,
        _id: position._id.toString(),
        createdAt: position.createdAt instanceof Date ? position.createdAt.toISOString() : position.createdAt
      }));
      
      console.log(`Loaded ${customPositions.length} custom positions from MongoDB`);
    } catch (dbError) {
      console.error('Error loading custom positions from MongoDB:', dbError);
      // Continue with empty custom positions - this is not a fatal error
    }

    // Combine default and custom positions
    const allPositions = [...defaultPositions, ...customPositions];

    return NextResponse.json({
      success: true,
      positions: allPositions
    });

  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}