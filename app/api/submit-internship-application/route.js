import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { R2Storage } from '../../../lib/r2-storage';
import { getCollection } from '../../../lib/mongodb';

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
      project1: formData.get('project1'),
      project2: formData.get('project2'),
      project3: formData.get('project3'),
      skills: formData.get('skills'),
      experience: formData.get('experience'),
      motivation: formData.get('motivation'),
      availability: formData.get('availability'),
      submittedAt: new Date(),
      status: 'pending'
    };

    // Validate required fields
    if (!applicationData.name || !applicationData.email || !applicationData.phone || !applicationData.position) {
      return NextResponse.json(
        { error: 'Name, email, phone, and position are required' },
        { status: 400 }
      );
    }

    // Handle resume upload to R2
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
        // Generate unique filename for R2
        const fileExtension = resumeFile.name.split('.').pop();
        const fileName = `resumes/${applicationData.applicationId}-${Date.now()}.${fileExtension}`;
        
        // Convert file to buffer
        const buffer = Buffer.from(await resumeFile.arrayBuffer());
        
        // Upload to R2 storage
        if (R2Storage.isAvailable()) {
          try {
            const resumeUrl = await R2Storage.uploadFile(fileName, buffer, resumeFile.type);
            
            // Store resume info in application data
            applicationData.resumeUrl = resumeUrl;
            applicationData.resumeFileName = fileName;
            applicationData.resumeOriginalName = resumeFile.name;
            applicationData.resumeSize = resumeFile.size;
            applicationData.resumeType = resumeFile.type;
            
            console.log('Resume uploaded to R2 successfully');
          } catch (r2Error) {
            console.error('R2 upload failed:', r2Error.message);
            return NextResponse.json(
              { error: 'Failed to upload resume to cloud storage. Please try again.' },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            { error: 'Cloud storage not available for resume upload. Please contact support.' },
            { status: 500 }
          );
        }
        
      } catch (error) {
        console.error('Error handling resume upload:', error);
        return NextResponse.json(
          { error: 'Failed to process resume. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Save application data to MongoDB
    try {
      const applicationsCollection = await getCollection('applications');
      const result = await applicationsCollection.insertOne(applicationData);
      
      if (result.insertedId) {
        console.log('Application saved to MongoDB successfully:', applicationData.applicationId);
      } else {
        throw new Error('Failed to insert application into database');
      }
    } catch (error) {
      console.error('Error saving application to MongoDB:', error);
      
      // If MongoDB save fails but resume was uploaded, we should clean up R2
      if (applicationData.resumeFileName && R2Storage.isAvailable()) {
        try {
          // Note: You might want to implement a cleanup method in R2Storage
          console.warn('Application save failed, but resume was uploaded. Manual cleanup may be required.');
        } catch (cleanupError) {
          console.error('Failed to cleanup uploaded resume:', cleanupError);
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to save application to database. Please try again.' },
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