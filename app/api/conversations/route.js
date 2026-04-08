import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/models';
import { ObjectId } from 'mongodb';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

const db = admin.database();

// GET - Fetch all conversations for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection(Collections.USERS);

    // Get all conversations from Firebase
    const conversationsRef = db.ref('conversations');
    const snapshot = await conversationsRef.once('value');
    
    const conversations = [];
    
    snapshot.forEach((childSnapshot) => {
      const convId = childSnapshot.key;
      const convData = childSnapshot.val();
      
      // Check if user is participant
      if (convData.metadata && convData.metadata.participants && convData.metadata.participants[userId]) {
        const otherUserId = convId.split('_').find(id => id !== userId);
        
        // Count unread messages
        let unreadCount = 0;
        if (convData.messages) {
          Object.values(convData.messages).forEach(msg => {
            if (msg.receiverId === userId && !msg.read) {
              unreadCount++;
            }
          });
        }
        
        conversations.push({
          conversationId: convId,
          otherUserId,
          lastMessage: convData.metadata.lastMessage || '',
          lastMessageTime: convData.metadata.lastMessageTime || Date.now(),
          unreadCount,
        });
      }
    });

    // Sort by last message time
    conversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

    // Fetch user details for each conversation
    const validObjectIds = [];
    const stringIds = [];
    
    conversations.forEach(c => {
      if (c.otherUserId === 'admin') {
        stringIds.push(c.otherUserId);
      } else {
        try {
          validObjectIds.push(new ObjectId(c.otherUserId));
        } catch (e) {
          stringIds.push(c.otherUserId);
        }
      }
    });

    const users = validObjectIds.length > 0 
      ? await usersCollection.find({ _id: { $in: validObjectIds } }).toArray()
      : [];

    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u;
    });

    // Add admin user manually if needed
    if (stringIds.includes('admin')) {
      userMap['admin'] = {
        _id: 'admin',
        name: 'Admin',
        email: 'admin@techbuddyspace.com',
        role: 'admin',
        profileImage: null,
      };
    }

    const conversationsWithUsers = conversations.map(conv => ({
      ...conv,
      otherUser: {
        id: conv.otherUserId,
        name: userMap[conv.otherUserId]?.name || 'Unknown',
        email: userMap[conv.otherUserId]?.email || '',
        role: userMap[conv.otherUserId]?.role || 'intern',
        profileImage: userMap[conv.otherUserId]?.profileImage || null,
      },
    }));

    return NextResponse.json({
      success: true,
      conversations: conversationsWithUsers,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
