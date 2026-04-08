import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/models';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const senderId = formData.get('senderId');
    const receiverId = formData.get('receiverId');

    if (!file || !senderId || !receiverId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert file to base64 for simple storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    const messagesCollection = await getCollection(Collections.MESSAGES);
    const conversationId = [senderId, receiverId].sort().join('_');

    const attachment = {
      name: file.name,
      type: file.type,
      size: file.size,
      url: dataUrl, // In production, upload to Cloudflare R2 or similar
    };

    const newMessage = {
      senderId,
      receiverId,
      message: '', // Empty message, just attachment
      attachments: [attachment],
      read: false,
      conversationId,
      createdAt: new Date(),
    };

    const result = await messagesCollection.insertOne(newMessage);

    // Create notification for receiver
    const notificationsCollection = await getCollection(Collections.NOTIFICATIONS);
    const senderName = senderId === 'admin' ? 'Admin' : 'User';
    
    await notificationsCollection.insertOne({
      userId: receiverId,
      title: 'New File',
      message: `${senderName} sent you a file: ${file.name}`,
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
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
