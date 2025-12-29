import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

    // Try to read custom positions from file
    let customPositions = [];
    try {
      const positionsDir = path.join(process.cwd(), 'admin-data');
      const positionsFile = path.join(positionsDir, 'positions.json');
      
      if (fs.existsSync(positionsFile)) {
        const positionsData = fs.readFileSync(positionsFile, 'utf8');
        customPositions = JSON.parse(positionsData);
      }
    } catch (error) {
      console.warn('Could not load custom positions:', error.message);
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