import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quotation from '@/models/Quotation';
import { sendEmail } from '@/lib/email/emailService';
import { getFeedbackRequestEmailTemplate } from '@/lib/email/templates/feedbackEmail';

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { quotationId, clientEmail, clientName } = body;

    if (!quotationId) {
      return NextResponse.json(
        { success: false, error: 'Quotation ID is required' },
        { status: 400 }
      );
    }

    // Fetch the quotation
    const quotation = await Quotation.findById(quotationId);
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Prepare service/project data for feedback template
    const serviceData = {
      _id: quotation._id,
      projectTitle: quotation.projectTitle,
      projectDescription: quotation.projectDescription,
    };

    const clientData = {
      name: clientName || quotation.clientName,
      email: clientEmail || quotation.clientEmail,
    };

    // Generate email template
    const emailHtml = getFeedbackRequestEmailTemplate(serviceData, clientData);

    // Send email
    await sendEmail({
      to: clientData.email,
      subject: `We'd love your feedback on ${serviceData.projectTitle}! ⭐`,
      html: emailHtml,
      emailType: 'feedback_request',
      relatedDocument: {
        model: 'Quotation',
        id: quotation._id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback request sent successfully',
    });
  } catch (error) {
    console.error('Error sending feedback request:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
