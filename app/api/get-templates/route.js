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

    // Load templates from MongoDB only (no default templates)
    let templates = [];
    try {
      const templatesCollection = await getCollection('templates');
      templates = await templatesCollection.find({}).toArray();
      
      // Convert MongoDB _id to string and ensure proper date formatting
      templates = templates.map(template => ({
        ...template,
        _id: template._id.toString(),
        createdAt: template.createdAt instanceof Date ? template.createdAt.toISOString() : template.createdAt,
        updatedAt: template.updatedAt instanceof Date ? template.updatedAt.toISOString() : template.updatedAt
      }));
      
      console.log(`Loaded ${templates.length} templates from MongoDB`);
    } catch (dbError) {
      console.error('Error loading templates from MongoDB:', dbError);
      return NextResponse.json(
        { error: 'Failed to load templates from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      templates: templates
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
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

    const { title, type, url, description } = await request.json();
    
    if (!title || !type || !url) {
      return NextResponse.json(
        { error: 'Title, type, and URL are required' },
        { status: 400 }
      );
    }

    try {
      // Get templates collection
      const templatesCollection = await getCollection('templates');
      
      // Create new template document
      const newTemplate = {
        id: `custom-${Date.now()}`,
        title,
        type,
        url,
        description: description || '',
        createdAt: new Date()
      };

      // Insert into MongoDB
      const result = await templatesCollection.insertOne(newTemplate);
      
      if (!result.insertedId) {
        throw new Error('Failed to insert template into database');
      }
      
      console.log('Template added to MongoDB:', newTemplate.id);

      return NextResponse.json({
        success: true,
        message: 'Template added successfully',
        template: {
          ...newTemplate,
          _id: result.insertedId.toString(),
          createdAt: newTemplate.createdAt.toISOString()
        }
      });
      
    } catch (dbError) {
      console.error('MongoDB error adding template:', dbError);
      return NextResponse.json(
        { error: 'Failed to add template to database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error adding template:', error);
    return NextResponse.json(
      { error: 'Failed to add template' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Verify admin authentication
    const isAuthenticated = await verifyAdminSession();
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { id, title, type, url, description } = await request.json();
    
    if (!id || !title || !type || !url) {
      return NextResponse.json(
        { error: 'ID, title, type, and URL are required' },
        { status: 400 }
      );
    }

    // Only allow editing custom templates (all templates are now custom)
    // Remove this check since we don't have default templates anymore

    try {
      // Get templates collection
      const templatesCollection = await getCollection('templates');
      
      // Find and update the template
      const result = await templatesCollection.updateOne(
        { id },
        {
          $set: {
            title,
            type,
            url,
            description: description || '',
            updatedAt: new Date()
          }
        }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      
      if (result.modifiedCount === 0) {
        return NextResponse.json(
          { error: 'Failed to update template' },
          { status: 500 }
        );
      }
      
      // Get the updated template
      const updatedTemplate = await templatesCollection.findOne({ id });
      
      console.log('Template updated in MongoDB:', id);

      return NextResponse.json({
        success: true,
        message: 'Template updated successfully',
        template: {
          ...updatedTemplate,
          _id: updatedTemplate._id.toString(),
          createdAt: updatedTemplate.createdAt instanceof Date ? updatedTemplate.createdAt.toISOString() : updatedTemplate.createdAt,
          updatedAt: updatedTemplate.updatedAt instanceof Date ? updatedTemplate.updatedAt.toISOString() : updatedTemplate.updatedAt
        }
      });
      
    } catch (dbError) {
      console.error('MongoDB error updating template:', dbError);
      return NextResponse.json(
        { error: 'Failed to update template in database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
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
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Only allow deleting custom templates (all templates are now custom)
    // Remove this check since we don't have default templates anymore

    try {
      // Get templates collection
      const templatesCollection = await getCollection('templates');
      
      // Find the template before deleting
      const templateToDelete = await templatesCollection.findOne({ id });
      
      if (!templateToDelete) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      
      // Delete the template
      const result = await templatesCollection.deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: 'Failed to delete template' },
          { status: 500 }
        );
      }
      
      console.log('Template deleted from MongoDB:', id);

      return NextResponse.json({
        success: true,
        message: 'Template deleted successfully',
        deletedTemplate: {
          ...templateToDelete,
          _id: templateToDelete._id.toString(),
          createdAt: templateToDelete.createdAt instanceof Date ? templateToDelete.createdAt.toISOString() : templateToDelete.createdAt,
          updatedAt: templateToDelete.updatedAt instanceof Date ? templateToDelete.updatedAt.toISOString() : templateToDelete.updatedAt
        }
      });
      
    } catch (dbError) {
      console.error('MongoDB error deleting template:', dbError);
      return NextResponse.json(
        { error: 'Failed to delete template from database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}