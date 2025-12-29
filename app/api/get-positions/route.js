import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

// Helper function to verify admin session
async function verifyAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin-session');
  
  if (!sessionToken) {
    return false;
  }

  try {
    const decoded = Buffer.from(sessionToken.value, 'base64').toString();
    const [username, timestamp] = decoded.split(':');
    
    // Check if session is expired (24 hours)
    const sessionAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return sessionAge <= maxAge;
  } catch (error) {
    return false;
  }
}

export async function GET() {
  try {
    // Verify admin authentication
    const isAuthenticated = await verifyAdminSession();
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

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

export async function POST(request) {
  try {
    // Verify admin authentication
    const isAuthenticated = await verifyAdminSession();
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { title, description } = await request.json();
    
    if (!title) {
      return NextResponse.json(
        { error: 'Position title is required' },
        { status: 400 }
      );
    }

    // Create admin-data directory if it doesn't exist
    const positionsDir = path.join(process.cwd(), 'admin-data');
    if (!fs.existsSync(positionsDir)) {
      fs.mkdirSync(positionsDir, { recursive: true });
    }

    // Load existing custom positions
    const positionsFile = path.join(positionsDir, 'positions.json');
    let customPositions = [];
    
    if (fs.existsSync(positionsFile)) {
      try {
        const positionsData = fs.readFileSync(positionsFile, 'utf8');
        customPositions = JSON.parse(positionsData);
      } catch (error) {
        console.warn('Could not parse existing positions:', error.message);
      }
    }

    // Add new position
    const newPosition = {
      id: `custom-${Date.now()}`,
      title,
      description: description || '',
      isDefault: false,
      createdAt: new Date().toISOString()
    };

    customPositions.push(newPosition);

    // Save updated positions
    fs.writeFileSync(positionsFile, JSON.stringify(customPositions, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Position added successfully',
      position: newPosition
    });

  } catch (error) {
    console.error('Error adding position:', error);
    return NextResponse.json(
      { error: 'Failed to add position' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Verify admin authentication
    const isAuthenticated = await verifyAdminSession();
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      );
    }

    // Only allow deleting custom positions
    if (!id.startsWith('custom-')) {
      return NextResponse.json(
        { error: 'Cannot delete default positions' },
        { status: 400 }
      );
    }

    // Load existing custom positions
    const positionsDir = path.join(process.cwd(), 'admin-data');
    const positionsFile = path.join(positionsDir, 'positions.json');
    let customPositions = [];
    
    if (fs.existsSync(positionsFile)) {
      try {
        const positionsData = fs.readFileSync(positionsFile, 'utf8');
        customPositions = JSON.parse(positionsData);
      } catch (error) {
        return NextResponse.json(
          { error: 'Could not load positions' },
          { status: 500 }
        );
      }
    }

    // Find and remove the position
    const positionIndex = customPositions.findIndex(p => p.id === id);
    if (positionIndex === -1) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    const deletedPosition = customPositions[positionIndex];
    customPositions.splice(positionIndex, 1);

    // Save updated positions
    fs.writeFileSync(positionsFile, JSON.stringify(customPositions, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Position deleted successfully',
      deletedPosition
    });

  } catch (error) {
    console.error('Error deleting position:', error);
    return NextResponse.json(
      { error: 'Failed to delete position' },
      { status: 500 }
    );
  }
}