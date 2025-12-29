import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCollection } from '../../../lib/mongodb';
import { R2Storage } from '../../../lib/r2-storage';

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

    const { templateId, templateUrl, applicationId, customData = {} } = await request.json();
    
    if (!templateId || !templateUrl || !applicationId) {
      return NextResponse.json(
        { error: 'Template ID, URL, and application ID are required' },
        { status: 400 }
      );
    }

    // Load application data from MongoDB
    let applicationData;
    try {
      const applicationsCollection = await getCollection('applications');
      applicationData = await applicationsCollection.findOne({ applicationId });
      
      if (!applicationData) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      
      console.log('Application data loaded from MongoDB:', applicationId);
    } catch (dbError) {
      console.error('Error loading application from MongoDB:', dbError);
      return NextResponse.json(
        { error: 'Failed to load application data' },
        { status: 500 }
      );
    }

    // Load field mappings for this template from MongoDB
    let fieldMappings = {};
    try {
      const mappingsCollection = await getCollection('template-mappings');
      const mappingDocument = await mappingsCollection.findOne({ templateId });
      
      if (mappingDocument) {
        fieldMappings = mappingDocument.fieldMappings || {};
        console.log('Field mappings loaded from MongoDB:', templateId);
      } else {
        console.warn('No field mappings found for template:', templateId);
      }
    } catch (dbError) {
      console.error('Error loading field mappings from MongoDB:', dbError);
      // Continue without mappings - this is not a fatal error
    }

    // Prepare template data using field mappings
    const templateData = {};
    
    // Add common system data
    templateData.currentDate = new Date().toLocaleDateString();
    templateData.company = 'TechBuddy Space';
    
    // Map application data to template fields
    Object.entries(fieldMappings).forEach(([placeholderKey, schemaKey]) => {
      if (schemaKey && schemaKey !== 'custom') {
        // Map from application data
        if (schemaKey === 'submittedAt') {
          templateData[placeholderKey] = new Date(applicationData[schemaKey]).toLocaleDateString();
        } else if (schemaKey === 'currentDate') {
          templateData[placeholderKey] = new Date().toLocaleDateString();
        } else {
          templateData[placeholderKey] = applicationData[schemaKey] || '';
        }
      }
    });

    // Add any custom data provided (for manual fields)
    Object.entries(customData).forEach(([key, value]) => {
      templateData[key] = value;
    });

    // Generate document using existing API
    let generateResponse;
    try {
      generateResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-from-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateUrl,
          data: templateData
        }),
      });
    } catch (error) {
      console.error('Error calling generate-from-url:', error);
      return NextResponse.json(
        { error: 'Failed to connect to document generation service' },
        { status: 500 }
      );
    }

    if (!generateResponse.ok) {
      console.error('Generate response not ok:', generateResponse.status, generateResponse.statusText);
      return NextResponse.json(
        { error: `Document generation failed: ${generateResponse.status} ${generateResponse.statusText}` },
        { status: 500 }
      );
    }

    // Get the document as a buffer
    let documentBuffer;
    try {
      documentBuffer = await generateResponse.arrayBuffer();
    } catch (error) {
      console.error('Error reading document buffer:', error);
      return NextResponse.json(
        { error: 'Failed to read generated document' },
        { status: 500 }
      );
    }
    
    const docBuffer = Buffer.from(documentBuffer);
    
    // Generate a filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = (templateData.name || 'document').replace(/[^a-zA-Z0-9]/g, '-');
    const filename = `${safeName}-${timestamp}.docx`;
    
    // Save document to R2 storage instead of local temp folder
    try {
      if (!R2Storage.isAvailable()) {
        return NextResponse.json(
          { error: 'Cloud storage not available for document storage' },
          { status: 500 }
        );
      }
      
      // Upload document to R2
      const r2Key = `generated-documents/${filename}`;
      const documentUrl = await R2Storage.uploadFile(r2Key, docBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      
      console.log('Document uploaded to R2 successfully:', r2Key);

      return NextResponse.json({
        success: true,
        documentUrl: documentUrl,
        filename: filename,
        templateData: templateData,
        applicationId: applicationId
      });
      
    } catch (error) {
      console.error('Error saving document to R2:', error);
      return NextResponse.json(
        { error: 'Failed to save generated document to cloud storage' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error generating document with mapping:', error);
    return NextResponse.json(
      { error: 'Failed to generate document with mapping' },
      { status: 500 }
    );
  }
}