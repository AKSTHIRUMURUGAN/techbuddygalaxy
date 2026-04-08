import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Fetch leave requests
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    
    const leavesCollection = await getCollection(Collections.LEAVES);
    const usersCollection = await getCollection(Collections.USERS);
    
    let query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;
    
    const leaves = await leavesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    // Fetch user details for each leave
    const userIds = [...new Set(leaves.map(l => l.userId))];
    const users = await usersCollection
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } })
      .toArray();
    
    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = {
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
      };
    });
    
    // Enrich leaves with user details
    const enrichedLeaves = leaves.map(leave => ({
      ...leave,
      userName: userMap[leave.userId]?.name || 'Unknown User',
      userRole: userMap[leave.userId]?.role || 'N/A',
      userEmail: userMap[leave.userId]?.email || '',
      userDepartment: userMap[leave.userId]?.department || '',
    }));
    
    return NextResponse.json({ success: true, leaves: enrichedLeaves });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaves' },
      { status: 500 }
    );
  }
}

// POST - Apply for leave
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, type, fromDate, toDate, reason, attachmentUrl } = body;
    
    if (!userId || !type || !fromDate || !toDate || !reason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const totalDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    
    const leavesCollection = await getCollection(Collections.LEAVES);
    
    const newLeave = {
      userId,
      type,
      fromDate: from,
      toDate: to,
      totalDays,
      reason,
      attachmentUrl: attachmentUrl || null, // Optional attachment
      status: 'Pending',
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await leavesCollection.insertOne(newLeave);
    
    // Create notification for admin
    const notificationsCollection = await getCollection(Collections.NOTIFICATIONS);
    await notificationsCollection.insertOne({
      userId: 'admin', // Send to all admins
      title: 'New Leave Request',
      message: `Leave request from user ${userId} for ${totalDays} days`,
      type: 'leave',
      link: `/admin/leaves/${result.insertedId}`,
      read: false,
      priority: 'medium',
      createdAt: new Date(),
    });
    
    return NextResponse.json({
      success: true,
      leaveId: result.insertedId,
      message: 'Leave request submitted successfully',
    });
  } catch (error) {
    console.error('Error applying for leave:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to apply for leave' },
      { status: 500 }
    );
  }
}

// PATCH - Approve/Reject leave
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { leaveId, status, approvedBy, rejectionReason } = body;
    
    if (!leaveId || !status || !approvedBy) {
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
    
    const leavesCollection = await getCollection(Collections.LEAVES);
    
    const updateData = {
      status,
      approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date(),
    };
    
    if (status === 'Rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    const result = await leavesCollection.updateOne(
      { _id: new ObjectId(leaveId) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Leave request not found' },
        { status: 404 }
      );
    }
    
    // Get leave details to notify user
    const leave = await leavesCollection.findOne({ _id: new ObjectId(leaveId) });
    
    // Notify user
    const notificationsCollection = await getCollection(Collections.NOTIFICATIONS);
    await notificationsCollection.insertOne({
      userId: leave.userId,
      title: `Leave Request ${status}`,
      message: `Your leave request has been ${status.toLowerCase()}`,
      type: 'leave',
      link: `/leaves/${leaveId}`,
      read: false,
      priority: 'high',
      createdAt: new Date(),
    });
    
    return NextResponse.json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error('Error updating leave:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update leave' },
      { status: 500 }
    );
  }
}
