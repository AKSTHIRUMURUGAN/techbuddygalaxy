import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCollection } from '../../../lib/mongodb';
import fs from 'fs';
import path from 'path';

// Helper function to verify admin session
async function verifyAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin-session');
  
  if (!sessionToken) {
    return false;
  }

  try {
    const decoded = Buffer.from(sessionToken.value, 'base64').toString();
    const [, timestamp] = decoded.split(':');
    
    // Check if session is expired (24 hours)
    const sessionAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return sessionAge <= maxAge;
  } catch (error) {
    return false;
  }
}

export async function POST() {
  try {
    // Verify admin authentication
    const isAuthenticated = await verifyAdminSession();
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const applicationsDir = path.join(process.cwd(), 'applications');
    
    // Check if local applications directory exists
    if (!fs.existsSync(applicationsDir)) {
      return NextResponse.json({
        success: true,
        message: 'No local applications directory found. Nothing to migrate.',
        migrated: 0,
        errors: []
      });
    }

    // Read all application files
    const files = fs.readdirSync(applicationsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const migrationResults = {
      total: jsonFiles.length,
      migrated: 0,
      errors: [],
      skipped: []
    };

    // Get MongoDB collection
    const applicationsCollection = await getCollection('applications');

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(applicationsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const applicationData = JSON.parse(fileContent);
        
        // Check if application already exists in MongoDB
        const existingApplication = await applicationsCollection.findOne({ 
          applicationId: applicationData.applicationId 
        });
        
        if (existingApplication) {
          migrationResults.skipped.push({
            applicationId: applicationData.applicationId,
            reason: 'Already exists in MongoDB'
          });
          continue;
        }

        // Convert submittedAt to Date object if it's a string
        if (typeof applicationData.submittedAt === 'string') {
          applicationData.submittedAt = new Date(applicationData.submittedAt);
        }

        // Convert other date fields if they exist
        if (applicationData.statusUpdatedAt && typeof applicationData.statusUpdatedAt === 'string') {
          applicationData.statusUpdatedAt = new Date(applicationData.statusUpdatedAt);
        }

        // Insert application into MongoDB
        const result = await applicationsCollection.insertOne(applicationData);
        
        if (result.insertedId) {
          migrationResults.migrated++;
          console.log(`Migrated application to MongoDB: ${applicationData.applicationId}`);
        } else {
          throw new Error('Failed to insert into MongoDB');
        }
        
      } catch (error) {
        console.error(`Error migrating application ${file}:`, error);
        migrationResults.errors.push({
          file: file,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed. ${migrationResults.migrated} applications migrated to MongoDB.`,
      results: migrationResults
    });

  } catch (error) {
    console.error('Error during migration:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Verify admin authentication
    const isAuthenticated = await verifyAdminSession();
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const applicationsDir = path.join(process.cwd(), 'applications');
    const status = {
      mongodbAvailable: true, // We'll assume MongoDB is available if we get this far
      localDirectoryExists: fs.existsSync(applicationsDir),
      localApplicationCount: 0,
      mongodbApplicationCount: 0
    };

    // Count local applications
    if (status.localDirectoryExists) {
      try {
        const files = fs.readdirSync(applicationsDir);
        status.localApplicationCount = files.filter(file => file.endsWith('.json')).length;
      } catch (error) {
        status.localApplicationCount = 'Error reading directory';
      }
    }

    // Count MongoDB applications
    try {
      const applicationsCollection = await getCollection('applications');
      status.mongodbApplicationCount = await applicationsCollection.countDocuments();
    } catch (error) {
      status.mongodbAvailable = false;
      status.mongodbApplicationCount = 'Error connecting to MongoDB';
    }

    return NextResponse.json({
      success: true,
      status
    });

  } catch (error) {
    console.error('Error checking migration status:', error);
    return NextResponse.json(
      { error: 'Failed to check migration status', details: error.message },
      { status: 500 }
    );
  }
}