import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Fetch OD requests
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    
    const odCollection = await getCollection(Collections.OD_REQUESTS);
    
    let query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;
    
    const requests = await odCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching OD requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch OD requests' },
      { status: 500 }
    );
  }
}

// POST - Apply for OD
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, date, reason, location, proof } = body;
    
    if (!userId || !date || !reason || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const odCollection = await getCollection(Collections.OD_REQUESTS);
    
    const newOD = {
      userId,
      date: new Date(date),
      reason,
      location,
      proof: proof || null,
      status: 'Pending',
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await odCollection.insertOne(newOD);
    
    // Create notification for admin
    const notificationsCollection = await getCollection(Collections.NOTIFICATIONS);
    await notificationsCollection.insertOne({
      userId: 'admin',
      title: 'New OD Request',
      message: `OD request from user ${userId} for ${location}`,
      type: 'alert',
      link: `/admin/od-requests/${result.insertedId}`,
      read: false,
      priority: 'medium',
      createdAt: new Date(),
    });
    
    return NextResponse.json({
      success: true,
      odId: result.insertedId,
      message: 'OD request submitted successfully',
    });
  } catch (error) {
    console.error('Error applying for OD:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to apply for OD' },
      { status: 500 }
    );
  }
}

// PATCH - Approve/Reject OD
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { odId, status, approvedBy, rejectionReason } = body;
    
    if (!odId || !status || !approvedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    const odCollection = await getCollection(Collections.OD_REQUESTS);
    
    const updateData = {
      status,
      approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date(),
    };
    
    if (status === 'Rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    const result = await odCollection.updateOne(
      { _id: new ObjectId(odId) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'OD request not found' },
        { status: 404 }
      );
    }
    
    // Get OD details to notify user
    const od = await odCollection.findOne({ _id: new ObjectId(odId) });
    
    // Update attendance if approved
    if (status === 'Approved') {
      const attendanceCollection = await getCollection(Collections.ATTENDANCE);
      const odDate = new Date(od.date);
      odDate.setHours(0, 0, 0, 0);
      
      await attendanceCollection.updateOne(
        { userId: od.userId, date: odDate },
        {
          $set: {
            status: 'On Duty',
            notes: `OD: ${od.reason}`,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }
    
    // Notify user
    const notificationsCollection = await getCollection(Collections.NOTIFICATIONS);
    await notificationsCollection.insertOne({
      userId: od.userId,
      title: `OD Request ${status}`,
      message: `Your OD request has been ${status.toLowerCase()}`,
      type: 'alert',
      link: `/od-requests/${odId}`,
      read: false,
      priority: 'high',
      createdAt: new Date(),
    });
    
    return NextResponse.json({
      success: true,
      message: `OD request ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error('Error updating OD:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update OD' },
      { status: 500 }
    );
  }
}
