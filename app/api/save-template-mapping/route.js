import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCollection } from '../../../lib/mongodb';

// Helper function to verify admin session
async function verifyAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin-session');
  
  if (!sessionToken) {
    return false;
  }

  try {
    const decoded = Buffer.from(sessionToken.value, 'base64').toString();
    const [username, timestamp] = decoded.split(':');
    
    // Check if session is expired (24 hours)
    const sessionAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return sessionAge <= maxAge;
  } catch (error) {
    return false;
  }
}

export async function POST(request) {
  try {
    // Verify admin authentication
    const isAuthenticated = await verifyAdminSession();
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { templateId, templateUrl, fieldMappings } = await request.json();
    
    if (!templateId || !templateUrl || !fieldMappings) {
      return NextResponse.json(
        { error: 'Template ID, URL, and field mappings are required' },
        { status: 400 }
      );
    }

    try {
      // Get template mappings collection
      const mappingsCollection = await getCollection('template-mappings');
      
      // Create mapping document
      const mappingDocument = {
        templateId,
        templateUrl,
        fieldMappings,
        updatedAt: new Date(),
        createdAt: new Date()
      };

      // Check if mapping already exists
      const existingMapping = await mappingsCollection.findOne({ templateId });
      
      if (existingMapping) {
        // Update existing mapping
        mappingDocument.createdAt = existingMapping.createdAt; // Preserve original creation date
        const result = await mappingsCollection.replaceOne(
          { templateId },
          mappingDocument
        );
        
        if (result.modifiedCount === 0) {
          throw new Error('Failed to update template mapping');
        }
        
        console.log('Template mapping updated in MongoDB:', templateId);
      } else {
        // Insert new mapping
        const result = await mappingsCollection.insertOne(mappingDocument);
        
        if (!result.insertedId) {
          throw new Error('Failed to insert template mapping');
        }
        
        console.log('Template mapping saved to MongoDB:', templateId);
      }

      return NextResponse.json({
        success: true,
        message: 'Template mapping saved successfully'
      });
      
    } catch (dbError) {
      console.error('MongoDB error saving template mapping:', dbError);
      return NextResponse.json(
        { error: 'Failed to save template mapping to database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error saving template mapping:', error);
    return NextResponse.json(
      { error: 'Failed to save template mapping' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Verify admin authentication
    const isAuthenticated = await verifyAdminSession();
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    
    try {
      // Get template mappings collection
      const mappingsCollection = await getCollection('template-mappings');
      
      if (templateId) {
        // Return mapping for specific template
        const mapping = await mappingsCollection.findOne({ templateId });
        
        return NextResponse.json({
          success: true,
          mapping: mapping || null
        });
      } else {
        // Return all mappings
        const mappings = await mappingsCollection.find({}).toArray();
        
        // Convert to the expected format (object with templateId as keys)
        const mappingsObject = {};
        mappings.forEach(mapping => {
          mappingsObject[mapping.templateId] = mapping;
        });
        
        return NextResponse.json({
          success: true,
          mappings: mappingsObject
        });
      }
      
    } catch (dbError) {
      console.error('MongoDB error fetching template mappings:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch template mappings from database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching template mapping:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template mapping' },
      { status: 500 }
    );
  }
}