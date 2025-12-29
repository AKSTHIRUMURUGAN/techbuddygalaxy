import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

    // Define the application schema based on the internship application structure
    const applicationSchema = [
      {
        key: 'name',
        label: 'Full Name',
        type: 'text',
        description: 'Applicant\'s full name'
      },
      {
        key: 'email',
        label: 'Email Address',
        type: 'email',
        description: 'Applicant\'s email address'
      },
      {
        key: 'phone',
        label: 'Phone Number',
        type: 'tel',
        description: 'Applicant\'s phone number'
      },
      {
        key: 'position',
        label: 'Position/Role',
        type: 'text',
        description: 'Applied position or role title'
      },
      {
        key: 'college',
        label: 'College/University',
        type: 'text',
        description: 'Educational institution name'
      },
      {
        key: 'department',
        label: 'Department/Branch',
        type: 'text',
        description: 'Academic department or branch'
      },
      {
        key: 'year',
        label: 'Academic Year',
        type: 'text',
        description: 'Current academic year (e.g., 3rd Year)'
      },
      {
        key: 'skills',
        label: 'Skills',
        type: 'text',
        description: 'Technical skills and competencies'
      },
      {
        key: 'experience',
        label: 'Experience',
        type: 'text',
        description: 'Previous work or project experience'
      },
      {
        key: 'github',
        label: 'GitHub Profile',
        type: 'url',
        description: 'GitHub profile URL'
      },
      {
        key: 'linkedin',
        label: 'LinkedIn Profile',
        type: 'url',
        description: 'LinkedIn profile URL'
      },
      {
        key: 'portfolio',
        label: 'Portfolio Website',
        type: 'url',
        description: 'Personal portfolio or website URL'
      },
      {
        key: 'motivation',
        label: 'Motivation',
        type: 'text',
        description: 'Why they want to join the internship'
      },
      {
        key: 'availability',
        label: 'Availability',
        type: 'text',
        description: 'When they can start and their availability'
      },
      {
        key: 'submittedAt',
        label: 'Application Date',
        type: 'date',
        description: 'When the application was submitted'
      },
      {
        key: 'applicationId',
        label: 'Application ID',
        type: 'text',
        description: 'Unique application identifier'
      },
      // Common template fields
      {
        key: 'company',
        label: 'Company Name',
        type: 'text',
        description: 'Company or organization name'
      },
      {
        key: 'startDate',
        label: 'Start Date',
        type: 'date',
        description: 'Employment or internship start date'
      },
      {
        key: 'endDate',
        label: 'End Date',
        type: 'date',
        description: 'Employment or internship end date'
      },
      {
        key: 'duration',
        label: 'Duration',
        type: 'text',
        description: 'Length of employment or internship'
      },
      {
        key: 'salary',
        label: 'Salary/Stipend',
        type: 'text',
        description: 'Compensation amount'
      },
      {
        key: 'manager',
        label: 'Manager/Supervisor',
        type: 'text',
        description: 'Name of manager or supervisor'
      },
      {
        key: 'department_work',
        label: 'Work Department',
        type: 'text',
        description: 'Department where work will be performed'
      },
      {
        key: 'location',
        label: 'Work Location',
        type: 'text',
        description: 'Office or work location'
      },
      {
        key: 'currentDate',
        label: 'Current Date',
        type: 'date',
        description: 'Today\'s date'
      }
    ];

    return NextResponse.json({
      success: true,
      schema: applicationSchema
    });

  } catch (error) {
    console.error('Error fetching application schema:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application schema' },
      { status: 500 }
    );
  }
}