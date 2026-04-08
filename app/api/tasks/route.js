import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/models';
import { ObjectId } from 'mongodb';
import EmailService from '@/lib/email';

// GET - Fetch all tasks or tasks for a specific user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    
    const tasksCollection = await getCollection(Collections.TASKS);
    
    let query = {};
    if (userId) query.assignedTo = userId;
    if (status) query.status = status;
    
    const tasks = await tasksCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST - Create a new task
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      assignedTo,
      createdBy,
      deadline,
      priority = 'Medium',
      tags = [],
      estimatedHours,
    } = body;
    
    if (!title || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Title and createdBy are required' },
        { status: 400 }
      );
    }
    
    const tasksCollection = await getCollection(Collections.TASKS);
    
    const newTask = {
      title,
      description,
      assignedTo: assignedTo || null, // Allow null for unassigned tasks
      createdBy,
      status: 'Pending',
      priority,
      deadline: deadline ? new Date(deadline) : null,
      startDate: null,
      completedDate: null,
      subtasks: [],
      attachments: [],
      notes: [],
      progress: 0,
      aiScore: null,
      aiFeedback: null,
      tags,
      estimatedHours,
      actualHours: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await tasksCollection.insertOne(newTask);
    
    // Create notification for assigned user (only if assigned)
    if (assignedTo) {
      const notificationsCollection = await getCollection(Collections.NOTIFICATIONS);
      await notificationsCollection.insertOne({
        userId: assignedTo,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${title}`,
        type: 'task',
        link: `/tasks/${result.insertedId}`,
        read: false,
        priority: priority.toLowerCase(),
        createdAt: new Date(),
      });
    }
    
    return NextResponse.json({
      success: true,
      taskId: result.insertedId,
      message: 'Task created successfully',
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// PUT - Assign task to user
export async function PUT(request) {
  try {
    const body = await request.json();
    const { taskId, assignedTo } = body;
    
    if (!taskId || !assignedTo) {
      return NextResponse.json(
        { success: false, error: 'Task ID and assignedTo are required' },
        { status: 400 }
      );
    }
    
    const tasksCollection = await getCollection(Collections.TASKS);
    
    // Get task details for notification
    const task = await tasksCollection.findOne({ _id: new ObjectId(taskId) });
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Get intern details for email
    const usersCollection = await getCollection(Collections.USERS);
    const intern = await usersCollection.findOne({ _id: new ObjectId(assignedTo) });
    
    if (!intern) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update task
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(taskId) },
      { 
        $set: { 
          assignedTo,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Create notification for assigned user
    const notificationsCollection = await getCollection(Collections.NOTIFICATIONS);
    await notificationsCollection.insertOne({
      userId: assignedTo,
      title: 'New Task Assigned',
      message: `You have been assigned a task: ${task.title}`,
      type: 'task',
      link: `/tasks/${taskId}`,
      read: false,
      priority: task.priority.toLowerCase(),
      createdAt: new Date(),
    });
    
    // Send email notification
    try {
      await EmailService.sendTaskAssignmentEmail(task, intern);
    } catch (emailError) {
      console.error('Failed to send task assignment email:', emailError);
      // Don't fail the request if email fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Task assigned successfully',
    });
  } catch (error) {
    console.error('Error assigning task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign task' },
      { status: 500 }
    );
  }
}

// PATCH - Update task
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { taskId, ...updates } = body;
    
    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    const tasksCollection = await getCollection(Collections.TASKS);
    
    // Handle status changes
    if (updates.status === 'In Progress' && !updates.startDate) {
      updates.startDate = new Date();
    }
    if (updates.status === 'Completed' && !updates.completedDate) {
      updates.completedDate = new Date();
      updates.progress = 100;
    }
    
    updates.updatedAt = new Date();
    
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE - Delete task
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    
    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    const tasksCollection = await getCollection(Collections.TASKS);
    
    const result = await tasksCollection.deleteOne({
      _id: new ObjectId(taskId),
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
