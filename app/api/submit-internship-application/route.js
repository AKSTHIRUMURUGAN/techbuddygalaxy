import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { R2Storage } from '../../../lib/r2-storage';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const applicationData = {
      applicationId: uuidv4(),
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      position: formData.get('position'),
      isStudent: formData.get('isStudent') === 'true',
      college: formData.get('college'),
      department: formData.get('department'),
      year: formData.get('year'),
      github: formData.get('github'),
      linkedin: formData.get('linkedin'),
      portfolio: formData.get('portfolio'),
      skills: formData.get('skills'),
      experience: formData.get('experience'),
      motivation: formData.get('motivation'),
      availability: formData.get('availability'),
      submittedAt: new Date().toISOString(),
    };

    // Validate required fields
    if (!applicationData.name || !applicationData.email || !applicationData.phone || !applicationData.position) {
      return NextResponse.json(
        { error: 'Name, email, phone, and position are required' },
        { status: 400 }
      );
    }

    // Handle resume upload
    const resumeFile = formData.get('resume');
    
    if (resumeFile && resumeFile.size > 0) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(resumeFile.type)) {
        return NextResponse.json(
          { error: 'Resume must be a PDF or Word document' },
          { status: 400 }
        );
      }

      // Validate file size (5MB max)
      if (resumeFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Resume file size must be less than 5MB' },
          { status: 400 }
        );
      }

      try {
        // Generate unique filename
        const fileExtension = resumeFile.name.split('.').pop();
        const fileName = `resumes/${applicationData.applicationId}-${Date.now()}.${fileExtension}`;
        
        // Convert file to buffer
        const buffer = Buffer.from(await resumeFile.arrayBuffer());
        
        let resumeUrl = null;
        
        // Try R2 storage first, fallback to local storage
        if (R2Storage.isAvailable()) {
          try {
            resumeUrl = await R2Storage.uploadFile(fileName, buffer, resumeFile.type);
            console.log('Resume uploaded to R2 successfully');
          } catch (r2Error) {
            console.warn('R2 upload failed, falling back to local storage:', r2Error.message);
            resumeUrl = null;
          }
        }
        
        // Fallback to local storage if R2 failed or not available
        if (!resumeUrl) {
          // Create applications directory if it doesn't exist
          const applicationsDir = path.join(process.cwd(), 'applications');
          if (!fs.existsSync(applicationsDir)) {
            fs.mkdirSync(applicationsDir, { recursive: true });
          }

          // Save file locally
          const localFileName = `resume-${applicationData.applicationId}.${fileExtension}`;
          const filePath = path.join(applicationsDir, localFileName);
          fs.writeFileSync(filePath, buffer);
          
          // Use local filename for reference
          applicationData.resumeFileName = localFileName;
          console.log('Resume saved locally');
        } else {
          // R2 upload successful
          applicationData.resumeUrl = resumeUrl;
          applicationData.resumeFileName = fileName;
        }
        
        // Add common resume info to application data
        applicationData.resumeOriginalName = resumeFile.name;
        applicationData.resumeSize = resumeFile.size;
        applicationData.resumeType = resumeFile.type;
        
      } catch (error) {
        console.error('Error handling resume upload:', error);
        return NextResponse.json(
          { error: 'Failed to save resume. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Save application data to local file
    try {
      const applicationsDir = path.join(process.cwd(), 'applications');
      if (!fs.existsSync(applicationsDir)) {
        fs.mkdirSync(applicationsDir, { recursive: true });
      }

      const applicationFile = path.join(applicationsDir, `${applicationData.applicationId}.json`);
      fs.writeFileSync(applicationFile, JSON.stringify(applicationData, null, 2));
    } catch (error) {
      console.error('Error saving application:', error);
      return NextResponse.json(
        { error: 'Failed to save application. Please try again.' },
        { status: 500 }
      );
    }

    // Send email notifications (optional - will not fail if email service is not configured)
    try {
      // Try to send emails if email service is available
      const { EmailService } = await import('../../../lib/email');
      
      // Send notification to admin
      await EmailService.sendApplicationNotification(applicationData);
      
      // Send confirmation to applicant
      await EmailService.sendApplicationConfirmation(applicationData);
      
      console.log('Email notifications sent successfully');
    } catch (error) {
      console.warn('Email service not available or failed:', error.message);
      // Continue without failing - emails are optional
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully!',
      applicationId: applicationData.applicationId,
    });

  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      { error: 'Failed to process application. Please try again.' },
      { status: 500 }
    );
  }
}