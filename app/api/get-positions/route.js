import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCollection } from '../../../lib/mongodb';

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
        createdAt: position.createdAt instanceof Date ? position.createdAt.toISOString() : position.createdAt,
        isDefault: false // All positions from DB are custom
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
    console.error('Error in GET /api/get-positions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    try {
      // Get positions collection
      const positionsCollection = await getCollection('positions');
      
      // Create new position document
      const newPosition = {
        id: `custom-${Date.now()}`,
        title,
        description: description || '',
        isDefault: false,
        createdAt: new Date()
      };

      // Insert into MongoDB
      const result = await positionsCollection.insertOne(newPosition);
      
      if (!result.insertedId) {
        throw new Error('Failed to insert position into database');
      }
      
      console.log('Position added to MongoDB:', newPosition.id);

      return NextResponse.json({
        success: true,
        message: 'Position added successfully',
        position: {
          ...newPosition,
          _id: result.insertedId.toString(),
          createdAt: newPosition.createdAt.toISOString()
        }
      });
      
    } catch (dbError) {
      console.error('MongoDB error adding position:', dbError);
      return NextResponse.json(
        { error: 'Failed to add position to database' },
        { status: 500 }
      );
    }

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

    // Only allow deleting custom positions (all positions are now custom)
    // Remove this check since we don't have default positions anymore

    try {
      // Get positions collection
      const positionsCollection = await getCollection('positions');
      
      // Find the position before deleting
      const positionToDelete = await positionsCollection.findOne({ id });
      
      if (!positionToDelete) {
        return NextResponse.json(
          { error: 'Position not found' },
          { status: 404 }
        );
      }
      
      // Delete the position
      const result = await positionsCollection.deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: 'Failed to delete position' },
          { status: 500 }
        );
      }
      
      console.log('Position deleted from MongoDB:', id);

      return NextResponse.json({
        success: true,
        message: 'Position deleted successfully',
        deletedPosition: {
          ...positionToDelete,
          _id: positionToDelete._id.toString(),
          createdAt: positionToDelete.createdAt instanceof Date ? positionToDelete.createdAt.toISOString() : positionToDelete.createdAt
        }
      });
      
    } catch (dbError) {
      console.error('MongoDB error deleting position:', dbError);
      return NextResponse.json(
        { error: 'Failed to delete position from database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error deleting position:', error);
    return NextResponse.json(
      { error: 'Failed to delete position' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Verify admin authentication
    const isAuthenticated = await verifyAdminSession();
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { id, title, description } = await request.json();
    
    if (!id || !title) {
      return NextResponse.json(
        { error: 'Position ID and title are required' },
        { status: 400 }
      );
    }

    try {
      // Get positions collection
      const positionsCollection = await getCollection('positions');
      
      // Update the position
      const result = await positionsCollection.updateOne(
        { id },
        {
          $set: {
            title,
            description: description || '',
            updatedAt: new Date()
          }
        }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Position not found' },
          { status: 404 }
        );
      }
      
      // Get the updated position
      const updatedPosition = await positionsCollection.findOne({ id });
      
      console.log('Position updated in MongoDB:', id);

      return NextResponse.json({
        success: true,
        message: 'Position updated successfully',
        position: {
          ...updatedPosition,
          _id: updatedPosition._id.toString(),
          createdAt: updatedPosition.createdAt instanceof Date ? updatedPosition.createdAt.toISOString() : updatedPosition.createdAt,
          updatedAt: updatedPosition.updatedAt instanceof Date ? updatedPosition.updatedAt.toISOString() : updatedPosition.updatedAt
        }
      });
      
    } catch (dbError) {
      console.error('MongoDB error updating position:', dbError);
      return NextResponse.json(
        { error: 'Failed to update position in database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error updating position:', error);
    return NextResponse.json(
      { error: 'Failed to update position' },
      { status: 500 }
    );
  }
}