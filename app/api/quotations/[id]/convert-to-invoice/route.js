import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quotation from '@/models/Quotation';
import mongoose from 'mongoose';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    // Delete cached Invoice model to ensure we get the latest schema
    if (mongoose.models.Invoice) {
      delete mongoose.models.Invoice;
    }
    
    // Import Invoice model fresh
    const Invoice = (await import('@/models/Invoice')).default;
    
    const { id } = await params;
    
    // Fetch the quotation
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Check if invoice already exists for this quotation
    const existingInvoice = await Invoice.findOne({ quotation: quotation._id });
    if (existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice already exists for this quotation', invoice: existingInvoice },
        { status: 400 }
      );
    }

    // Generate invoice number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Find the last invoice of this month
    const lastInvoice = await Invoice
      .findOne({ invoiceNumber: new RegExp(`^INV${year}${month}`) })
      .sort({ invoiceNumber: -1 })
      .lean();
    
    let sequence = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.slice(-4));
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }
    
    const invoiceNumber = `INV${year}${month}${String(sequence).padStart(4, '0')}`;

    // Calculate due date (15 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    // Check if quotation was paid
    const isPaid = quotation.paymentStatus === 'completed' && quotation.paidAmount > 0;

    // Prepare invoice data
    const invoiceData = {
      invoiceNumber,
      quotation: quotation._id,
      clientName: quotation.clientName,
      clientEmail: quotation.clientEmail,
      clientPhone: quotation.clientPhone,
      companyName: quotation.companyName,
      gstNumber: quotation.gstNumber,
      billingAddress: quotation.billingAddress,
      projectTitle: quotation.projectTitle,
      projectDescription: quotation.projectDescription,
      services: quotation.services,
      addOns: quotation.addOns,
      subtotal: quotation.subtotal,
      discount: quotation.discount || 0,
      taxRate: quotation.taxRate,
      taxAmount: quotation.taxAmount,
      totalAmount: quotation.totalAmount,
      balanceAmount: isPaid ? 0 : quotation.totalAmount, // If paid in quotation, balance is 0
      paidAmount: isPaid ? quotation.paidAmount : 0, // Transfer paid amount if quotation was paid
      currency: quotation.currency,
      invoiceDate: new Date(),
      dueDate: dueDate,
      paymentTerms: quotation.paymentTerms || 'Payment due within 15 days',
      notes: quotation.notes,
      termsAndConditions: quotation.termsAndConditions,
      status: 'draft',
      paymentStatus: isPaid ? 'paid' : 'pending', // Set to paid if quotation was paid
      paidAt: isPaid ? quotation.paidAt : undefined, // Transfer payment date
    };

    // Add payment record if quotation was paid
    if (isPaid) {
      invoiceData.payments = [{
        amount: quotation.paidAmount,
        paymentMethod: quotation.paymentMethod || 'online',
        transactionId: quotation.razorpayPaymentId || undefined,
        paymentDate: quotation.paidAt || new Date(),
        notes: 'Payment received via quotation',
      }];
    }

    // Only add client if it exists
    if (quotation.client) {
      invoiceData.client = quotation.client;
    }

    // Create invoice from quotation
    const invoice = await Invoice.create(invoiceData);

    // Update quotation status to indicate it has been converted
    quotation.status = 'accepted';
    quotation.acceptedAt = new Date();
    await quotation.save();

    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully from quotation',
      data: invoice,
    });
  } catch (error) {
    console.error('Error converting quotation to invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
