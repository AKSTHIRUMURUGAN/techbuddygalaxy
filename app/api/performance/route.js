import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections, calculatePerformanceScore } from '@/lib/models';

// GET - Fetch performance data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const performanceCollection = await getCollection(Collections.PERFORMANCE);
    const performance = await performanceCollection.findOne({ userId });
    
    if (!performance) {
      return NextResponse.json(
        { success: false, error: 'Performance data not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, performance });
  } catch (error) {
    console.error('Error fetching performance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch performance' },
      { status: 500 }
    );
  }
}

// POST - Calculate and update performance
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch tasks
    const tasksCollection = await getCollection(Collections.TASKS);
    const allTasks = await tasksCollection.find({ assignedTo: userId }).toArray();
    const completedTasks = allTasks.filter(t => t.status === 'Completed');
    
    // Calculate speed score (based on on-time completion)
    const tasksWithDeadline = completedTasks.filter(t => t.deadline);
    const onTimeTasks = tasksWithDeadline.filter(
      t => t.completedDate <= t.deadline
    );
    const onTimeRate = tasksWithDeadline.length > 0
      ? onTimeTasks.length / tasksWithDeadline.length
      : 0;
    const speedScore = onTimeRate * 100;
    
    // Calculate quality score (based on AI scores)
    const tasksWithAIScore = completedTasks.filter(t => t.aiScore !== null);
    const avgQuality = tasksWithAIScore.length > 0
      ? tasksWithAIScore.reduce((sum, t) => sum + t.aiScore, 0) / tasksWithAIScore.length
      : 0;
    const qualityScore = avgQuality * 10; // Convert to 0-100 scale
    
    // Calculate consistency score (based on regular task completion)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentTasks = completedTasks.filter(
      t => new Date(t.completedDate) >= last30Days
    );
    const consistencyScore = Math.min((recentTasks.length / 30) * 100, 100);
    
    // Calculate attendance score
    const attendanceCollection = await getCollection(Collections.ATTENDANCE);
    const last30DaysAttendance = await attendanceCollection
      .find({
        userId,
        date: { $gte: last30Days },
      })
      .toArray();
    
    const presentDays = last30DaysAttendance.filter(
      a => a.status === 'Present' || a.status === 'Late'
    ).length;
    const attendanceRate = last30DaysAttendance.length > 0
      ? presentDays / last30DaysAttendance.length
      : 0;
    const attendanceScore = attendanceRate * 100;
    
    // Calculate overall performance score
    const performanceScore = calculatePerformanceScore({
      speedScore,
      qualityScore,
      consistencyScore,
      attendanceScore,
    });
    
    // Calculate average completion time
    const tasksWithTime = completedTasks.filter(t => t.startDate && t.completedDate);
    const avgCompletionTime = tasksWithTime.length > 0
      ? tasksWithTime.reduce((sum, t) => {
          const hours = (new Date(t.completedDate) - new Date(t.startDate)) / (1000 * 60 * 60);
          return sum + hours;
        }, 0) / tasksWithTime.length
      : 0;
    
    // Update or create performance record
    const performanceCollection = await getCollection(Collections.PERFORMANCE);
    const performanceData = {
      userId,
      performanceScore: parseFloat(performanceScore.toFixed(2)),
      speedScore: parseFloat(speedScore.toFixed(2)),
      qualityScore: parseFloat(qualityScore.toFixed(2)),
      consistencyScore: parseFloat(consistencyScore.toFixed(2)),
      attendanceScore: parseFloat(attendanceScore.toFixed(2)),
      avgQuality: parseFloat(avgQuality.toFixed(2)),
      onTimeRate: parseFloat(onTimeRate.toFixed(2)),
      attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      tasksCompleted: completedTasks.length,
      tasksOnTime: onTimeTasks.length,
      totalTasks: allTasks.length,
      avgCompletionTime: parseFloat(avgCompletionTime.toFixed(2)),
      lastCalculated: new Date(),
      updatedAt: new Date(),
    };
    
    await performanceCollection.updateOne(
      { userId },
      { $set: performanceData, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      performance: performanceData,
      message: 'Performance calculated successfully',
    });
  } catch (error) {
    console.error('Error calculating performance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate performance' },
      { status: 500 }
    );
  }
}
