import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Invoice from '@/models/Invoice';
import { sendEmail } from '@/lib/email/emailService';
import { getInvoiceEmailTemplate } from '@/lib/email/templates/invoiceEmail';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Fetch the invoice
    const invoice = await Invoice.findById(id).populate('client');
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Generate email template
    const emailHtml = getInvoiceEmailTemplate(invoice);

    // Send email
    await sendEmail({
      to: invoice.clientEmail,
      subject: `Invoice ${invoice.invoiceNumber} from Tech Buddy Galaxy`,
      html: emailHtml,
      emailType: 'invoice_sent',
      relatedDocument: {
        model: 'Invoice',
        id: invoice._id,
      },
    });

    // Update invoice status to 'sent' if it was 'draft'
    if (invoice.status === 'draft') {
      invoice.status = 'sent';
      invoice.sentAt = new Date();
      await invoice.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully',
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
