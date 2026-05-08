import nodemailer from 'nodemailer';
import EmailLog from '@/models/EmailLog';

// Create reusable transporter (singleton pattern like lib/email.js)
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
    console.log('Email transporter initialized successfully');
  } else {
    console.warn('Email credentials not configured. EMAIL_USER and EMAIL_APP_PASSWORD required.');
  }
} catch (error) {
  console.error('Error creating email transporter:', error);
}

// Send email with logging
export async function sendEmail({ to, cc, bcc, subject, html, emailType, relatedDocument }) {
  if (!transporter) {
    const error = 'Email service not configured. Please set EMAIL_USER and EMAIL_APP_PASSWORD in .env.local';
    console.error(error);
    
    // Log failed email
    try {
      await EmailLog.create({
        to,
        cc,
        bcc,
        subject,
        emailType,
        relatedDocument,
        status: 'failed',
        errorMessage: error,
        sentAt: new Date(),
      });
    } catch (logError) {
      console.error('Failed to log email error:', logError);
    }
    
    return { success: false, error };
  }

  try {
    const mailOptions = {
      from: `${process.env.COMPANY_NAME || 'Tech Buddy Galaxy'} <${process.env.EMAIL_USER}>`,
      to,
      cc,
      bcc,
      subject,
      html,
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // Log email
    await EmailLog.create({
      to,
      cc,
      bcc,
      subject,
      emailType,
      relatedDocument,
      status: 'sent',
      sentAt: new Date(),
      metadata: { messageId: info.messageId },
    });
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    
    // Log failed email
    try {
      await EmailLog.create({
        to,
        cc,
        bcc,
        subject,
        emailType,
        relatedDocument,
        status: 'failed',
        errorMessage: error.message,
        sentAt: new Date(),
      });
    } catch (logError) {
      console.error('Failed to log email error:', logError);
    }
    
    return { success: false, error: error.message };
  }
}

// Verify email configuration
export async function verifyEmailConfig() {
  if (!transporter) {
    return { 
      success: false, 
      error: 'Email transporter not initialized. Check EMAIL_USER and EMAIL_APP_PASSWORD.' 
    };
  }

  try {
    await transporter.verify();
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('Email configuration error:', error);
    return { success: false, error: error.message };
  }
}
