import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Fetch notifications
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const notificationsCollection = await getCollection(Collections.NOTIFICATIONS);
    
    let query = { userId };
    if (unreadOnly) query.read = false;
    
    const notifications = await notificationsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
    const unreadCount = await notificationsCollection.countDocuments({
      userId,
      read: false,
    });
    
    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Create notification
export async function POST(request) {
  try {
    const { userId, title, message, type, link } = await request.json();
    
    if (!userId || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const notificationsCollection = await getCollection(Collections.NOTIFICATIONS);
    
    const notification = {
      userId,
      title,
      message,
      type: type || 'message',
      link: link || '',
      read: false,
      priority: 'medium',
      createdAt: new Date(),
    };
    
    const result = await notificationsCollection.insertOne(notification);
    
    return NextResponse.json({
      success: true,
      notification: {
        ...notification,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PATCH - Mark notification as read
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { notificationId, markAllRead, userId } = body;
    
    const notificationsCollection = await getCollection(Collections.NOTIFICATIONS);
    
    if (markAllRead && userId) {
      await notificationsCollection.updateMany(
        { userId, read: false },
        { $set: { read: true } }
      );
      
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    }
    
    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    const result = await notificationsCollection.updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { read: true } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');
    
    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    const notificationsCollection = await getCollection(Collections.NOTIFICATIONS);
    
    const result = await notificationsCollection.deleteOne({
      _id: new ObjectId(notificationId),
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
