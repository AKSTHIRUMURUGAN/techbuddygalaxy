import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Fetch attendance records
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    const attendanceCollection = await getCollection(Collections.ATTENDANCE);
    
    let query = {};
    if (userId) query.userId = userId;
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const records = await attendanceCollection
      .find(query)
      .sort({ date: -1 })
      .toArray();
    
    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

// POST - Check-in or Check-out
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, action, location, taskId } = body; // action: 'checkin', 'checkout', 'start-work', 'pause-work'
    
    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const attendanceCollection = await getCollection(Collections.ATTENDANCE);
    const tasksCollection = await getCollection(Collections.TASKS);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingRecord = await attendanceCollection.findOne({
      userId,
      date: { $gte: today },
    });
    
    if (action === 'checkin') {
      // Allow re-check-in if already checked out, otherwise prevent duplicate check-in
      if (existingRecord && existingRecord.checkIn && !existingRecord.checkOut) {
        return NextResponse.json(
          { success: false, error: 'Already checked in today' },
          { status: 400 }
        );
      }
      
      const checkInTime = new Date();
      const workStartTime = new Date();
      workStartTime.setHours(9, 0, 0, 0);
      
      const status = checkInTime > workStartTime ? 'Late' : 'Present';
      
      if (existingRecord) {
        // If re-checking in after checkout, reset checkout and continue
        await attendanceCollection.updateOne(
          { _id: existingRecord._id },
          {
            $set: {
              checkIn: existingRecord.checkOut ? checkInTime : existingRecord.checkIn, // Keep original check-in if not checked out
              checkOut: null, // Clear checkout to allow continuing work
              status,
              location,
              updatedAt: new Date(),
            },
          }
        );
      } else {
        await attendanceCollection.insertOne({
          userId,
          date: today,
          checkIn: checkInTime,
          checkOut: null,
          totalHours: 0,
          status,
          location,
          workSessions: [],
          notes: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      return NextResponse.json({
        success: true,
        message: existingRecord?.checkOut ? 'Checked in again successfully' : 'Checked in successfully',
        status,
      });
    } else if (action === 'start-work') {
      if (!existingRecord || !existingRecord.checkIn) {
        return NextResponse.json(
          { success: false, error: 'Please check in first' },
          { status: 400 }
        );
      }

      const { customTaskTitle } = body;

      // Task ID is optional now - can use custom task title instead
      if (!taskId && !customTaskTitle) {
        return NextResponse.json(
          { success: false, error: 'Task ID or custom task title is required' },
          { status: 400 }
        );
      }

      let taskTitle = customTaskTitle || 'Unknown Task';
      
      // Get task details if taskId is provided
      if (taskId) {
        const task = await tasksCollection.findOne({ _id: new ObjectId(taskId) });
        taskTitle = task?.title || 'Unknown Task';
      }
      
      const workSessions = existingRecord.workSessions || [];
      
      // Check if there's an ongoing session
      const ongoingSession = workSessions.find(s => !s.endTime);
      if (ongoingSession) {
        return NextResponse.json(
          { success: false, error: 'Please pause current work session first' },
          { status: 400 }
        );
      }

      // Start new work session
      workSessions.push({
        taskId: taskId || null,
        taskTitle: taskTitle,
        startTime: new Date(),
        endTime: null,
        duration: 0,
      });

      await attendanceCollection.updateOne(
        { _id: existingRecord._id },
        {
          $set: {
            workSessions,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Work session started',
      });
    } else if (action === 'pause-work') {
      if (!existingRecord || !existingRecord.checkIn) {
        return NextResponse.json(
          { success: false, error: 'No check-in record found' },
          { status: 400 }
        );
      }

      const workSessions = existingRecord.workSessions || [];
      const ongoingSession = workSessions.find(s => !s.endTime);

      if (!ongoingSession) {
        return NextResponse.json(
          { success: false, error: 'No active work session found' },
          { status: 400 }
        );
      }

      // End the current session
      const endTime = new Date();
      const duration = (endTime - new Date(ongoingSession.startTime)) / (1000 * 60 * 60);
      ongoingSession.endTime = endTime;
      ongoingSession.duration = parseFloat(duration.toFixed(2));

      await attendanceCollection.updateOne(
        { _id: existingRecord._id },
        {
          $set: {
            workSessions,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Work session paused',
      });
    } else if (action === 'checkout') {
      if (!existingRecord || !existingRecord.checkIn) {
        return NextResponse.json(
          { success: false, error: 'No check-in record found' },
          { status: 400 }
        );
      }
      
      if (existingRecord.checkOut) {
        return NextResponse.json(
          { success: false, error: 'Already checked out today' },
          { status: 400 }
        );
      }

      // End any ongoing work session
      const workSessions = existingRecord.workSessions || [];
      const ongoingSession = workSessions.find(s => !s.endTime);
      if (ongoingSession) {
        const endTime = new Date();
        const duration = (endTime - new Date(ongoingSession.startTime)) / (1000 * 60 * 60);
        ongoingSession.endTime = endTime;
        ongoingSession.duration = parseFloat(duration.toFixed(2));
      }
      
      const checkOutTime = new Date();
      const totalHours = (checkOutTime - existingRecord.checkIn) / (1000 * 60 * 60);
      
      let status = existingRecord.status;
      if (totalHours < 4) {
        status = 'Half Day';
      }
      
      await attendanceCollection.updateOne(
        { _id: existingRecord._id },
        {
          $set: {
            checkOut: checkOutTime,
            totalHours: parseFloat(totalHours.toFixed(2)),
            workSessions,
            status,
            updatedAt: new Date(),
          },
        }
      );
      
      return NextResponse.json({
        success: true,
        message: 'Checked out successfully',
        totalHours: parseFloat(totalHours.toFixed(2)),
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process attendance' },
      { status: 500 }
    );
  }
}
