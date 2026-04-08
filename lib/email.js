import nodemailer from 'nodemailer';

// Create transporter with error handling
let transporter = null;

try {
  if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  } else {
    console.warn('Email credentials not configured. Email service will be disabled.');
  }
} catch (error) {
  console.error('Error creating email transporter:', error);
}

export class EmailService {
  static async sendApplicationNotification(applicationData) {
    if (!transporter) {
      throw new Error('Email service not configured');
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'techbuddyspace@gmail.com',
        subject: `New Internship Application - ${applicationData.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b4cb8 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">New Internship Application</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">TechBuddy Space</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1e3a8a; margin-bottom: 20px;">Application Details</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #374151; margin-top: 0;">Personal Information</h3>
                <p><strong>Name:</strong> ${applicationData.name}</p>
                <p><strong>Email:</strong> ${applicationData.email}</p>
                <p><strong>Phone:</strong> ${applicationData.phone}</p>
              </div>
              
              ${applicationData.isStudent ? `
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #374151; margin-top: 0;">Education</h3>
                <p><strong>College:</strong> ${applicationData.college}</p>
                <p><strong>Department:</strong> ${applicationData.department}</p>
                <p><strong>Year:</strong> ${applicationData.year}</p>
              </div>
              ` : ''}
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #374151; margin-top: 0;">Professional Links</h3>
                <p><strong>GitHub:</strong> ${applicationData.github || 'Not provided'}</p>
                <p><strong>LinkedIn:</strong> ${applicationData.linkedin || 'Not provided'}</p>
                <p><strong>Portfolio:</strong> ${applicationData.portfolio || 'Not provided'}</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #374151; margin-top: 0;">Additional Information</h3>
                <p><strong>Skills:</strong> ${applicationData.skills || 'Not provided'}</p>
                <p><strong>Experience:</strong> ${applicationData.experience || 'Not provided'}</p>
                <p><strong>Motivation:</strong> ${applicationData.motivation || 'Not provided'}</p>
                <p><strong>Availability:</strong> ${applicationData.availability || 'Not provided'}</p>
              </div>
              
              <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; border-left: 4px solid #0891b2;">
                <p style="margin: 0;"><strong>Application ID:</strong> ${applicationData.applicationId}</p>
                <p style="margin: 10px 0 0 0;"><strong>Submitted:</strong> ${new Date(applicationData.submittedAt).toLocaleString()}</p>
                ${applicationData.resumeUrl ? `<p style="margin: 10px 0 0 0;"><strong>Resume:</strong> <a href="${applicationData.resumeUrl}" style="color: #0891b2;">View Resume</a></p>` : ''}
              </div>
            </div>
            
            <div style="background: #374151; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0;">TechBuddy Space - Admin Notification</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Application notification email sent successfully');
    } catch (error) {
      console.error('Error sending application notification email:', error);
      throw new Error('Failed to send notification email');
    }
  }

  static async sendApplicationConfirmation(applicationData) {
    if (!transporter) {
      throw new Error('Email service not configured');
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: applicationData.email,
        subject: 'Application Received - TechBuddy Space Internship',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b4cb8 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Application Received!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">TechBuddy Space</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1e3a8a;">Dear ${applicationData.name},</h2>
              
              <p>Thank you for applying for the internship position at TechBuddy Space! We have successfully received your application.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #06b6d4;">
                <h3 style="color: #374151; margin-top: 0;">Application Summary</h3>
                <p><strong>Application ID:</strong> ${applicationData.applicationId}</p>
                <p><strong>Submitted:</strong> ${new Date(applicationData.submittedAt).toLocaleString()}</p>
                <p><strong>Email:</strong> ${applicationData.email}</p>
              </div>
              
              <h3 style="color: #374151;">What's Next?</h3>
              <ul style="color: #4b5563; line-height: 1.6;">
                <li>Our team will review your application within 3-5 business days</li>
                <li>If your profile matches our requirements, we'll contact you for the next steps</li>
                <li>Please keep an eye on your email for updates</li>
              </ul>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;"><strong>Note:</strong> Please save your Application ID for future reference.</p>
              </div>
              
              <p>If you have any questions, feel free to reach out to us at <a href="mailto:techbuddyspace@gmail.com" style="color: #0891b2;">techbuddyspace@gmail.com</a></p>
              
              <p>Best regards,<br>
              <strong>TechBuddy Space Team</strong></p>
            </div>
            
            <div style="background: #374151; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0;">TechBuddy Space - Innovation Hub</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Application confirmation email sent successfully');
    } catch (error) {
      console.error('Error sending application confirmation email:', error);
      throw new Error('Failed to send confirmation email');
    }
  }

  static async sendApprovalEmail(applicationData) {
    if (!transporter) {
      throw new Error('Email service not configured');
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: applicationData.email,
        subject: '🎉 Congratulations! Your Internship Application has been Approved',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">🎉 Congratulations!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your application has been approved</p>
            </div>
            
            <div style="padding: 30px; background: #f0fdf4;">
              <h2 style="color: #059669;">Dear ${applicationData.name},</h2>
              
              <p>We are delighted to inform you that your internship application has been <strong>approved</strong>! Welcome to the TechBuddy Space family.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #374151; margin-top: 0;">Next Steps</h3>
                <ul style="color: #4b5563; line-height: 1.8;">
                  <li>You will receive your official appointment letter within 24 hours</li>
                  <li>Please check your email for onboarding instructions</li>
                  <li>Prepare for an exciting learning journey with us!</li>
                </ul>
              </div>
              
              <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #059669; margin-top: 0;">What to Expect</h3>
                <ul style="color: #065f46; line-height: 1.6;">
                  <li>Hands-on experience with real projects</li>
                  <li>Mentorship from industry experts</li>
                  <li>Skill development workshops</li>
                  <li>Certificate upon successful completion</li>
                  <li>Networking opportunities</li>
                </ul>
              </div>
              
              <p>We're excited to have you join our team and look forward to your contributions to our innovative projects.</p>
              
              <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:techbuddyspace@gmail.com" style="color: #059669;">techbuddyspace@gmail.com</a></p>
              
              <p>Welcome aboard!<br>
              <strong>TechBuddy Space Team</strong></p>
            </div>
            
            <div style="background: #374151; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0;">TechBuddy Space - Innovation Hub</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Approval email sent successfully');
    } catch (error) {
      console.error('Error sending approval email:', error);
      throw new Error('Failed to send approval email');
    }
  }

  static async sendRejectionEmail(applicationData, message) {
    if (!transporter) {
      throw new Error('Email service not configured');
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: applicationData.email,
        subject: 'Update on Your Internship Application - TechBuddy Space',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b4cb8 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Application Update</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">TechBuddy Space</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1e3a8a;">Dear ${applicationData.name},</h2>
              
              <p>Thank you for your interest in the internship position at TechBuddy Space and for taking the time to apply.</p>
              
              <p>After careful consideration of your application, we regret to inform you that we will not be moving forward with your candidacy at this time.</p>
              
              ${message ? `
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #374151; margin-top: 0;">Feedback</h3>
                <p style="color: #4b5563;">${message}</p>
              </div>
              ` : ''}
              
              <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0891b2; margin-top: 0;">Keep Growing!</h3>
                <p style="color: #0c4a6e;">We encourage you to:</p>
                <ul style="color: #0c4a6e; line-height: 1.6;">
                  <li>Continue developing your skills</li>
                  <li>Apply for future opportunities with us</li>
                  <li>Follow us for updates on new programs</li>
                  <li>Connect with our community for learning resources</li>
                </ul>
              </div>
              
              <p>We appreciate your interest in TechBuddy Space and wish you all the best in your future endeavors.</p>
              
              <p>Best regards,<br>
              <strong>TechBuddy Space Team</strong></p>
            </div>
            
            <div style="background: #374151; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0;">TechBuddy Space - Innovation Hub</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Rejection email sent successfully');
    } catch (error) {
      console.error('Error sending rejection email:', error);
      throw new Error('Failed to send rejection email');
    }
  }

  static async sendDocumentEmail(applicationData, documentType, documentUrl, templateTitle) {
    if (!transporter) {
      throw new Error('Email service not configured');
    }

    const documentTitles = {
      'appointment': templateTitle || 'Appointment Letter',
      'loi': templateTitle || 'Letter of Intent',
      'certificate': templateTitle || 'Completion Certificate',
      'experience': templateTitle || 'Experience Letter'
    };

    const documentTitle = documentTitles[documentType] || templateTitle || 'Document';

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: applicationData.email,
        subject: `Your ${documentTitle} - TechBuddy Space`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b4cb8 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Document Ready!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">TechBuddy Space</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1e3a8a;">Dear ${applicationData.name},</h2>
              
              <p>Your ${documentTitle} is ready for download.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #06b6d4; text-align: center;">
                <h3 style="color: #374151; margin-top: 0;">${documentTitle}</h3>
                <a href="${documentUrl}" style="display: inline-block; background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0;">
                  Download Document
                </a>
                <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                  This link will expire in 7 days for security purposes.
                </p>
              </div>
              
              <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0891b2; margin-top: 0;">Important Notes</h3>
                <ul style="color: #0c4a6e; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li>Please download and save this document for your records</li>
                  <li>Keep this document safe as it may be required for future reference</li>
                  <li>If you have any questions, please contact us immediately</li>
                </ul>
              </div>
              
              <p>Congratulations on this milestone! We're proud to have you as part of the TechBuddy Space family.</p>
              
              <p>Best regards,<br>
              <strong>TechBuddy Space Team</strong></p>
            </div>
            
            <div style="background: #374151; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0;">TechBuddy Space - Innovation Hub</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`${documentType} document email sent successfully`);
    } catch (error) {
      console.error(`Error sending ${documentType} document email:`, error);
      throw new Error(`Failed to send ${documentType} document email`);
    }
  }

  static async sendLoginCredentials(userData) {
    if (!transporter) {
      throw new Error('Email service not configured');
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userData.email,
        subject: '🔐 Your TechBuddy Space Intern Portal Login Credentials',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">🎉 Welcome to TechBuddy Space!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Intern Portal Access</p>
            </div>
            
            <div style="padding: 30px; background: #f0fdf4;">
              <h2 style="color: #059669;">Dear ${userData.name},</h2>
              
              <p>Congratulations! Your intern account has been created. You can now access the TechBuddy Space Intern Portal.</p>
              
              <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #374151; margin-top: 0;">🔐 Your Login Credentials</h3>
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
                  <p style="margin: 5px 0;"><strong>Email:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${userData.email}</code></p>
                  <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${userData.password}</code></p>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/intern" style="display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Login to Intern Portal
                  </a>
                </div>
              </div>
              
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; margin-top: 0;">⚠️ Important Security Notice</h3>
                <ul style="color: #78350f; line-height: 1.6; margin: 10px 0; padding-left: 20px;">
                  <li><strong>Change your password immediately</strong> after your first login</li>
                  <li>Never share your credentials with anyone</li>
                  <li>Keep this email secure or delete it after changing your password</li>
                  <li>Use a strong, unique password for your account</li>
                </ul>
              </div>
              
              <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #059669; margin-top: 0;">📱 What You Can Do in the Portal</h3>
                <ul style="color: #065f46; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                  <li>View and manage your tasks</li>
                  <li>Track your attendance</li>
                  <li>Monitor your performance metrics</li>
                  <li>Apply for leaves and OD requests</li>
                  <li>View leaderboard and compete with peers</li>
                  <li>Update your profile and skills</li>
                </ul>
              </div>
              
              <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0891b2; margin-top: 0;">💡 Getting Started Tips</h3>
                <ol style="color: #0c4a6e; line-height: 1.6; margin: 10px 0; padding-left: 20px;">
                  <li>Login and change your password immediately</li>
                  <li>Complete your profile information</li>
                  <li>Check your assigned tasks</li>
                  <li>Mark your attendance daily</li>
                  <li>Explore all the features available</li>
                </ol>
              </div>
              
              <p>If you face any issues logging in or have questions, please contact us at <a href="mailto:techbuddyspace@gmail.com" style="color: #059669;">techbuddyspace@gmail.com</a></p>
              
              <p>We're excited to have you on board and look forward to your contributions!</p>
              
              <p>Best regards,<br>
              <strong>TechBuddy Space Team</strong></p>
            </div>
            
            <div style="background: #374151; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 14px;">TechBuddy Space - Innovation Hub</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">This is an automated email. Please do not reply.</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Login credentials email sent successfully');
    } catch (error) {
      console.error('Error sending login credentials email:', error);
      throw new Error('Failed to send login credentials email');
    }
  }

  static async sendTaskAssignmentEmail(taskData, internData) {
    if (!transporter) {
      throw new Error('Email service not configured');
    }

    try {
      const priorityColors = {
        'Low': '#6b7280',
        'Medium': '#3b82f6',
        'High': '#f97316',
        'Urgent': '#ef4444'
      };

      const priorityColor = priorityColors[taskData.priority] || '#3b82f6';

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: internData.email,
        subject: `📋 New Task Assigned: ${taskData.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b4cb8 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">📋 New Task Assigned</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">TechBuddy Space</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1e3a8a;">Hi ${internData.name},</h2>
              
              <p>You have been assigned a new task. Please review the details below and start working on it.</p>
              
              <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${priorityColor};">
                <h3 style="color: #374151; margin-top: 0;">${taskData.title}</h3>
                <p style="color: #6b7280; line-height: 1.6;">${taskData.description || 'No description provided'}</p>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                      <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Priority</p>
                      <p style="margin: 5px 0; font-weight: bold; color: ${priorityColor};">${taskData.priority}</p>
                    </div>
                    ${taskData.deadline ? `
                    <div>
                      <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Deadline</p>
                      <p style="margin: 5px 0; font-weight: bold; color: #374151;">${new Date(taskData.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    ` : ''}
                    ${taskData.estimatedHours ? `
                    <div>
                      <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Estimated Hours</p>
                      <p style="margin: 5px 0; font-weight: bold; color: #374151;">${taskData.estimatedHours} hours</p>
                    </div>
                    ` : ''}
                  </div>
                </div>

                ${taskData.tags && taskData.tags.length > 0 ? `
                <div style="margin-top: 15px;">
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Tags</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                    ${taskData.tags.map(tag => `<span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 12px;">${tag}</span>`).join('')}
                  </div>
                </div>
                ` : ''}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/intern/tasks" style="display: inline-block; background: #1e3a8a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  View Task Details
                </a>
              </div>
              
              <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0891b2; margin-top: 0;">💡 Quick Tips</h3>
                <ul style="color: #0c4a6e; line-height: 1.6; margin: 10px 0; padding-left: 20px;">
                  <li>Review the task requirements carefully</li>
                  <li>Update task progress regularly</li>
                  <li>Ask questions if anything is unclear</li>
                  <li>Complete the task before the deadline</li>
                  <li>Mark the task as complete when done</li>
                </ul>
              </div>
              
              <p>If you have any questions about this task, please reach out to your supervisor or contact us at <a href="mailto:techbuddyspace@gmail.com" style="color: #1e3a8a;">techbuddyspace@gmail.com</a></p>
              
              <p>Best regards,<br>
              <strong>TechBuddy Space Team</strong></p>
            </div>
            
            <div style="background: #374151; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 14px;">TechBuddy Space - Innovation Hub</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">This is an automated email. Please do not reply.</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Task assignment email sent successfully');
    } catch (error) {
      console.error('Error sending task assignment email:', error);
      throw new Error('Failed to send task assignment email');
    }
  }

  static async sendPasswordOTP(userData) {
    if (!transporter) {
      throw new Error('Email service not configured');
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userData.email,
        subject: '🔐 Password Change OTP - TechBuddy Space',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">🔐 Password Change Request</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">TechBuddy Space</p>
            </div>
            
            <div style="padding: 30px; background: #fff7ed;">
              <h2 style="color: #f97316;">Hi ${userData.name},</h2>
              
              <p>You have requested to change your password. Use the OTP below to verify your identity.</p>
              
              <div style="background: white; padding: 30px; border-radius: 8px; margin: 30px 0; border: 2px solid #f97316; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Your OTP Code</p>
                <div style="font-size: 48px; font-weight: bold; color: #f97316; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${userData.otp}
                </div>
                <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">This code will expire in 5 minutes</p>
              </div>
              
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; margin-top: 0;">⚠️ Security Notice</h3>
                <ul style="color: #78350f; line-height: 1.6; margin: 10px 0; padding-left: 20px;">
                  <li>Never share this OTP with anyone</li>
                  <li>TechBuddy Space will never ask for your OTP</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Change your password immediately if you suspect unauthorized access</li>
                </ul>
              </div>
              
              <p>If you didn't request a password change, please contact us immediately at <a href="mailto:techbuddyspace@gmail.com" style="color: #f97316;">techbuddyspace@gmail.com</a></p>
              
              <p>Best regards,<br>
              <strong>TechBuddy Space Team</strong></p>
            </div>
            
            <div style="background: #374151; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 14px;">TechBuddy Space - Innovation Hub</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">This is an automated email. Please do not reply.</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Password OTP email sent successfully');
    } catch (error) {
      console.error('Error sending password OTP email:', error);
      throw new Error('Failed to send password OTP email');
    }
  }
}

export default EmailService;