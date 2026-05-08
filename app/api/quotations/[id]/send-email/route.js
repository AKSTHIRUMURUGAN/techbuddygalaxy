import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quotation from '@/models/Quotation';
import { sendEmail } from '@/lib/email/emailService';
import { getQuotationEmailTemplate } from '@/lib/email/templates/quotationEmail';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Generate email HTML
    const emailHtml = getQuotationEmailTemplate(quotation);
    
    // Send email
    const result = await sendEmail({
      to: quotation.clientEmail,
      subject: `Quotation ${quotation.quotationNumber} - ${quotation.projectTitle}`,
      html: emailHtml,
      emailType: 'quotation_sent',
      relatedDocument: {
        model: 'Quotation',
        id: quotation._id,
      },
    });

    if (result.success) {
      // Update quotation status
      quotation.status = 'sent';
      quotation.sentAt = new Date();
      await quotation.save();

      return NextResponse.json({
        success: true,
        message: 'Quotation sent successfully',
        data: quotation,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending quotation email:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
