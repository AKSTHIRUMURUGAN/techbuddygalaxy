import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StartupStarterRegistration from '@/models/StartupStarterRegistration';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email } = await request.json();

    // Find existing registration
    const registration = await StartupStarterRegistration.findOne({ 
      email: email.toLowerCase() 
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'No registration found with this email' },
        { status: 404 }
      );
    }

    // Generate QR Code
    const qrData = JSON.stringify({
      ticketId: registration.ticketId,
      name: registration.name,
      email: registration.email,
      rollNo: registration.rollNo
    });
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff'
      }
    });

    // Send email
    await sendConfirmationEmail(registration, qrCodeDataURL);

    return NextResponse.json({
      success: true,
      message: 'Email resent successfully'
    });
  } catch (error) {
    console.error('Resend email error:', error);
    return NextResponse.json(
      { error: 'Failed to resend email' },
      { status: 500 }
    );
  }
}

async function sendConfirmationEmail(registration, qrCodeDataURL) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  // Extract base64 data from data URL
  const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #ea580c 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.95; }
        .content { background: #f9fafb; padding: 30px 20px; }
        .content h2 { color: #1e3a8a; margin-top: 0; }
        .ticket { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .qr-container { margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 10px; }
        .qr-image { max-width: 300px; width: 100%; height: auto; display: block; margin: 0 auto; border: 3px solid #1e3a8a; border-radius: 10px; }
        .ticket-id { font-size: 18px; font-weight: bold; color: #1e3a8a; margin: 15px 0; font-family: 'Courier New', monospace; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .info-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .info-table td:first-child { font-weight: bold; color: #1e3a8a; width: 40%; }
        .important { background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 5px; }
        .important h3 { color: #92400e; margin-top: 0; font-size: 18px; }
        .important ul { margin: 10px 0; padding-left: 20px; }
        .important li { margin: 8px 0; color: #78350f; }
        .section { margin: 25px 0; }
        .section h3 { color: #1e3a8a; font-size: 18px; margin-bottom: 10px; }
        .section ul { margin: 10px 0; padding-left: 20px; }
        .section li { margin: 8px 0; color: #4b5563; }
        .footer { background: #374151; color: white; padding: 20px; text-align: center; }
        .footer p { margin: 5px 0; font-size: 14px; }
        .highlight { background: #dbeafe; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
        .resend-notice { background: #e0f2fe; padding: 15px; border-left: 4px solid #0891b2; margin: 20px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Startup Starter - Your Ticket</h1>
          <p>Don't Learn Startup. Build One.</p>
        </div>
        
        <div class="content">
          <div class="resend-notice">
            <p style="margin: 0; color: #0c4a6e;"><strong>📧 Email Resent:</strong> This is your requested confirmation email with QR ticket.</p>
          </div>

          <h2>Hi ${registration.name}! 👋</h2>
          <p>Here's your registration confirmation for <strong>Startup Starter</strong>.</p>
          
          <div class="ticket">
            <h3 style="color: #1e3a8a; margin-top: 0;">Your Event Ticket</h3>
            
            <div class="qr-container">
              <img src="cid:qrcode" alt="QR Ticket" class="qr-image" />
              <div class="ticket-id">Ticket ID: ${registration.ticketId}</div>
            </div>
            
            <table class="info-table">
              <tr>
                <td>Name:</td>
                <td>${registration.name}</td>
              </tr>
              <tr>
                <td>Roll No:</td>
                <td>${registration.rollNo}</td>
              </tr>
              <tr>
                <td>Department:</td>
                <td>${registration.department}</td>
              </tr>
              <tr>
                <td>College:</td>
                <td>${registration.college}</td>
              </tr>
            </table>
          </div>
          
          <div class="important">
            <h3>⚠️ Important Instructions:</h3>
            <ul>
              <li><strong>Save this QR code</strong> - You'll need it for entry and attendance</li>
              <li><strong>Bring your laptop</strong> - Fully charged with basic software installed</li>
              <li><strong>Attendance:</strong> QR will be scanned <span class="highlight">twice</span> (morning & evening) for OD eligibility</li>
              <li><strong>Active participation required</strong> - Complete all tasks to receive certification</li>
              <li><strong>Team formation:</strong> Maximum 2 friends per team</li>
            </ul>
          </div>
          
          <div class="section">
            <h3>📅 Event Details:</h3>
            <ul>
              <li><strong>Duration:</strong> Full Day (8.1 Hours)</li>
              <li><strong>Format:</strong> Hands-On Bootcamp</li>
              <li><strong>Mode:</strong> Offline - Interactive</li>
              <li><strong>Venue:</strong> Will be shared soon</li>
            </ul>
          </div>
          
          <div class="section">
            <h3>🎯 What You'll Build:</h3>
            <ul>
              <li>✅ Validated Problem Statement</li>
              <li>✅ Solution Design & MVP</li>
              <li>✅ Business Model & Pitch Deck</li>
              <li>✅ Company Brand Identity</li>
              <li>✅ Live Shark Tank Pitch</li>
            </ul>
          </div>
          
          <div class="section">
            <h3>🏆 Rewards:</h3>
            <ul>
              <li>🎓 Certification by DPIIT, Startup India, EDC & TECHBUDDYSPACE</li>
              <li>📋 OD Credit (for active participants)</li>
              <li>🚀 Top 10 teams get mentorship & incubation guidance</li>
            </ul>
          </div>
          
          <div class="footer">
            <p><strong>Organized by:</strong> TECHBUDDYSPACE Private Limited × EDC Club, REC</p>
            <p>Part of Campus to Career Catalyst Initiative</p>
            <p style="margin-top: 15px;">For queries, contact: <a href="mailto:techbuddyspace@gmail.com" style="color: #60a5fa;">techbuddyspace@gmail.com</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Startup Starter - TECHBUDDYSPACE" <${process.env.EMAIL_USER}>`,
    to: registration.email,
    subject: '🎉 Your Startup Starter QR Ticket (Resent)',
    html: htmlContent,
    attachments: [
      {
        filename: 'qr-ticket.png',
        content: base64Data,
        encoding: 'base64',
        cid: 'qrcode'
      }
    ]
  });
}
