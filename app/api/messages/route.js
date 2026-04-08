import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/models';
import { ObjectId } from 'mongodb';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const db = admin.database();

// GET - Fetch messages between two users
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const otherUserId = searchParams.get('otherUserId');
    const conversationId = searchParams.get('conversationId');

    let messages = [];

    if (conversationId) {
      // Fetch from Firebase
      const messagesRef = db.ref(`conversations/${conversationId}/messages`);
      const snapshot = await messagesRef.orderByChild('createdAt').once('value');
      
      snapshot.forEach((childSnapshot) => {
        messages.push({
          _id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
    } else if (userId && otherUserId) {
      const convId = [userId, otherUserId].sort().join('_');
      const messagesRef = db.ref(`conversations/${convId}/messages`);
      const snapshot = await messagesRef.orderByChild('createdAt').once('value');
      
      snapshot.forEach((childSnapshot) => {
        messages.push({
          _id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
    }

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(request) {
  try {
    const { senderId, receiverId, message, attachments } = await request.json();

    if (!senderId || !receiverId || (!message && (!attachments || attachments.length === 0))) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const conversationId = [senderId, receiverId].sort().join('_');

    // Save to Firebase
    const messagesRef = db.ref(`conversations/${conversationId}/messages`);
    const newMessageRef = messagesRef.push();
    
    const newMessage = {
      senderId,
      receiverId,
      message: message || '',
      attachments: attachments || [],
      read: false,
      createdAt: Date.now(),
    };

    await newMessageRef.set(newMessage);

    // Update conversation metadata
    const conversationRef = db.ref(`conversations/${conversationId}/metadata`);
    await conversationRef.update({
      lastMessage: message || 'Sent an attachment',
      lastMessageTime: Date.now(),
      participants: {
        [senderId]: true,
        [receiverId]: true,
      },
    });

    // Create notification in MongoDB
    const notificationsCollection = await getCollection(Collections.NOTIFICATIONS);
    const senderName = senderId === 'admin' ? 'Admin' : 'User';
    
    await notificationsCollection.insertOne({
      userId: receiverId,
      title: 'New Message',
      message: `You have a new message from ${senderName}`,
      type: 'message',
      link: receiverId === 'admin' ? `/admin/messages` : `/intern/messages`,
      read: false,
      priority: 'medium',
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: {
        ...newMessage,
        _id: newMessageRef.key,
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// PATCH - Mark messages as read
export async function PATCH(request) {
  try {
    const { conversationId, userId } = await request.json();

    // Update read status in Firebase
    const messagesRef = db.ref(`conversations/${conversationId}/messages`);
    const snapshot = await messagesRef.once('value');
    
    const updates = {};
    snapshot.forEach((childSnapshot) => {
      const msg = childSnapshot.val();
      if (msg.receiverId === userId && !msg.read) {
        updates[`${childSnapshot.key}/read`] = true;
      }
    });

    if (Object.keys(updates).length > 0) {
      await messagesRef.update(updates);
    }

    return NextResponse.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
