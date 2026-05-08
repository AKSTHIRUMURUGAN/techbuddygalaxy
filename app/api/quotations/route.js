import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quotation from '@/models/Quotation';
import Client from '@/models/Client';
import { sendEmail } from '@/lib/email/emailService';
import { getQuotationEmailTemplate } from '@/lib/email/templates/quotationEmail';

// GET - Fetch all quotations
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status) query.status = status;
    if (clientId) query.client = clientId;
    
    const quotations = await Quotation.find(query)
      .populate('client', 'name email companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Quotation.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: quotations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new quotation
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.projectTitle || !body.services || body.services.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate client information (either client ID or manual entry)
    if (!body.client && (!body.clientName || !body.clientEmail)) {
      return NextResponse.json(
        { success: false, error: 'Client information is required' },
        { status: 400 }
      );
    }
    
    // Calculate totals
    let subtotal = 0;
    const processedServices = body.services.map(service => {
      const itemTotal = service.quantity * service.unitPrice * (1 - service.discount / 100);
      subtotal += itemTotal;
      return {
        ...service,
        total: itemTotal,
      };
    });
    
    const taxAmount = subtotal * (body.taxRate || 18) / 100;
    const totalAmount = subtotal + taxAmount;
    
    let quotationData = {
      ...body,
      services: processedServices,
      subtotal,
      taxAmount,
      totalAmount,
    };

    // Get client details if client ID is provided
    if (body.client) {
      const client = await Client.findById(body.client);
      if (client) {
        quotationData.clientName = client.name;
        quotationData.clientEmail = client.email;
        quotationData.clientPhone = client.phone;
        quotationData.companyName = client.companyName;
        quotationData.gstNumber = client.gstNumber;
        quotationData.billingAddress = client.billingAddress;
      }
    }

    // Generate quotation number manually as fallback
    if (!quotationData.quotationNumber) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      // Find the last quotation of this month
      const lastQuotation = await Quotation
        .findOne({ quotationNumber: new RegExp(`^QT${year}${month}`) })
        .sort({ quotationNumber: -1 })
        .lean();
      
      let sequence = 1;
      if (lastQuotation && lastQuotation.quotationNumber) {
        const lastSequence = parseInt(lastQuotation.quotationNumber.slice(-4));
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }
      
      quotationData.quotationNumber = `QT${year}${month}${String(sequence).padStart(4, '0')}`;
      console.log('Manually generated quotation number:', quotationData.quotationNumber);
    }
    
    // Create quotation
    const quotation = await Quotation.create(quotationData);
    
    // Send email if status is 'sent'
    if (body.status === 'sent') {
      const emailHtml = getQuotationEmailTemplate(quotation);
      await sendEmail({
        to: quotation.clientEmail,
        subject: `Quotation ${quotation.quotationNumber} - ${quotation.projectTitle}`,
        html: emailHtml,
        emailType: 'quotation_sent',
        relatedDocument: {
          model: 'Quotation',
          id: quotation._id,
        },
      });
      
      quotation.sentAt = new Date();
      await quotation.save();
    }
    
    return NextResponse.json({
      success: true,
      data: quotation,
      message: 'Quotation created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating quotation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
