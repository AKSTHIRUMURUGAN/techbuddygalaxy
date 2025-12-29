import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

    // Default templates
    const defaultTemplates = [
      {
        id: 'appointment-letter',
        title: 'Appointment Letter',
        type: 'appointment',
        url: 'https://docs.google.com/document/d/1example-appointment/export?format=docx',
        description: 'Official appointment letter for internship'
      },
      {
        id: 'loi-template',
        title: 'Letter of Intent',
        type: 'loi',
        url: 'https://docs.google.com/document/d/1example-loi/export?format=docx',
        description: 'Letter of intent for internship program'
      },
      {
        id: 'certificate-template',
        title: 'Completion Certificate',
        type: 'certificate',
        url: 'https://docs.google.com/document/d/1example-certificate/export?format=docx',
        description: 'Certificate of completion for internship'
      },
      {
        id: 'experience-letter',
        title: 'Experience Letter',
        type: 'experience',
        url: 'https://docs.google.com/document/d/1example-experience/export?format=docx',
        description: 'Experience letter after internship completion'
      }
    ];

    // Try to read custom templates from file
    let customTemplates = [];
    try {
      const templatesDir = path.join(process.cwd(), 'admin-data');
      const templatesFile = path.join(templatesDir, 'templates.json');
      
      if (fs.existsSync(templatesFile)) {
        const templatesData = fs.readFileSync(templatesFile, 'utf8');
        customTemplates = JSON.parse(templatesData);
      }
    } catch (error) {
      console.warn('Could not load custom templates:', error.message);
    }

    // Combine default and custom templates
    const allTemplates = [...defaultTemplates, ...customTemplates];

    return NextResponse.json({
      success: true,
      templates: allTemplates
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

    // Create admin-data directory if it doesn't exist
    const templatesDir = path.join(process.cwd(), 'admin-data');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    // Load existing custom templates
    const templatesFile = path.join(templatesDir, 'templates.json');
    let customTemplates = [];
    
    if (fs.existsSync(templatesFile)) {
      try {
        const templatesData = fs.readFileSync(templatesFile, 'utf8');
        customTemplates = JSON.parse(templatesData);
      } catch (error) {
        console.warn('Could not parse existing templates:', error.message);
      }
    }

    // Add new template
    const newTemplate = {
      id: `custom-${Date.now()}`,
      title,
      type,
      url,
      description: description || '',
      createdAt: new Date().toISOString()
    };

    customTemplates.push(newTemplate);

    // Save updated templates
    fs.writeFileSync(templatesFile, JSON.stringify(customTemplates, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Template added successfully',
      template: newTemplate
    });

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

    // Only allow editing custom templates
    if (!id.startsWith('custom-')) {
      return NextResponse.json(
        { error: 'Cannot edit default templates' },
        { status: 400 }
      );
    }

    // Load existing custom templates
    const templatesDir = path.join(process.cwd(), 'admin-data');
    const templatesFile = path.join(templatesDir, 'templates.json');
    let customTemplates = [];
    
    if (fs.existsSync(templatesFile)) {
      try {
        const templatesData = fs.readFileSync(templatesFile, 'utf8');
        customTemplates = JSON.parse(templatesData);
      } catch (error) {
        return NextResponse.json(
          { error: 'Could not load templates' },
          { status: 500 }
        );
      }
    }

    // Find and update the template
    const templateIndex = customTemplates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Update template
    customTemplates[templateIndex] = {
      ...customTemplates[templateIndex],
      title,
      type,
      url,
      description: description || '',
      updatedAt: new Date().toISOString()
    };

    // Save updated templates
    fs.writeFileSync(templatesFile, JSON.stringify(customTemplates, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Template updated successfully',
      template: customTemplates[templateIndex]
    });

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

    // Only allow deleting custom templates
    if (!id.startsWith('custom-')) {
      return NextResponse.json(
        { error: 'Cannot delete default templates' },
        { status: 400 }
      );
    }

    // Load existing custom templates
    const templatesDir = path.join(process.cwd(), 'admin-data');
    const templatesFile = path.join(templatesDir, 'templates.json');
    let customTemplates = [];
    
    if (fs.existsSync(templatesFile)) {
      try {
        const templatesData = fs.readFileSync(templatesFile, 'utf8');
        customTemplates = JSON.parse(templatesData);
      } catch (error) {
        return NextResponse.json(
          { error: 'Could not load templates' },
          { status: 500 }
        );
      }
    }

    // Find and remove the template
    const templateIndex = customTemplates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const deletedTemplate = customTemplates[templateIndex];
    customTemplates.splice(templateIndex, 1);

    // Save updated templates
    fs.writeFileSync(templatesFile, JSON.stringify(customTemplates, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
      deletedTemplate
    });

  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}