import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Fetch users
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    
    const usersCollection = await getCollection(Collections.USERS);
    
    let query = {};
    if (userId) {
      query._id = new ObjectId(userId);
    }
    if (role) {
      query.role = role;
    }
    
    if (userId) {
      const user = await usersCollection.findOne(query);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return NextResponse.json({
        success: true,
        user: {
          ...userWithoutPassword,
          _id: userWithoutPassword._id.toString(),
        },
      });
    }
    
    const users = await usersCollection.find(query).toArray();
    
    // Remove passwords from all users
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        _id: userWithoutPassword._id.toString(),
      };
    });
    
    return NextResponse.json({
      success: true,
      users: usersWithoutPasswords,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
