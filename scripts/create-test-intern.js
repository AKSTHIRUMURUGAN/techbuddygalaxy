// Script to create a test intern user
// Run with: node scripts/create-test-intern.js

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = "mongodb+srv://techbuddyspace_db_user:techbuddyspace@internship.fdjsc9m.mongodb.net/internship?retryWrites=true&w=majority&tls=true";

async function createTestIntern() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('internship');
    const usersCollection = db.collection('users');

    // Check if test user already exists
    const existing = await usersCollection.findOne({ email: 'intern@example.com' });
    
    if (existing) {
      console.log('Test intern already exists!');
      console.log('Email: intern@example.com');
      console.log('Password: password123');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test intern
    const result = await usersCollection.insertOne({
      email: 'intern@example.com',
      password: hashedPassword,
      name: 'Test Intern',
      role: 'intern',
      department: 'Development',
      phone: '+1234567890',
      joinDate: new Date(),
      profileImage: null,
      skills: ['JavaScript', 'React', 'Node.js'],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Test intern created successfully!');
    console.log('User ID:', result.insertedId);
    console.log('\nLogin credentials:');
    console.log('Email: intern@example.com');
    console.log('Password: password123');

    // Create initial performance record
    const performanceCollection = db.collection('performance');
    await performanceCollection.insertOne({
      userId: result.insertedId.toString(),
      performanceScore: 0,
      speedScore: 0,
      qualityScore: 0,
      consistencyScore: 0,
      attendanceScore: 0,
      avgQuality: 0,
      onTimeRate: 0,
      attendanceRate: 0,
      tasksCompleted: 0,
      tasksOnTime: 0,
      totalTasks: 0,
      avgCompletionTime: 0,
      lastCalculated: new Date(),
      monthlyScores: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Performance record created');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

createTestIntern();
