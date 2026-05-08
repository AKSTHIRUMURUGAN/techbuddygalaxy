import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quotation from '@/models/Quotation';
import Razorpay from 'razorpay';

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

    // Check if Razorpay is enabled for this quotation
    if (!quotation.razorpayEnabled) {
      return NextResponse.json(
        { success: false, error: 'Online payment not enabled for this quotation' },
        { status: 400 }
      );
    }

    // Check if Razorpay credentials are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create Razorpay order
    const options = {
      amount: Math.round(quotation.totalAmount * 100), // Amount in paise
      currency: quotation.currency || 'INR',
      receipt: quotation.quotationNumber,
      notes: {
        quotationId: quotation._id.toString(),
        quotationNumber: quotation.quotationNumber,
        clientName: quotation.clientName,
        clientEmail: quotation.clientEmail,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save order ID to quotation
    quotation.razorpayOrderId = order.id;
    quotation.paymentStatus = 'processing';
    await quotation.save();

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: quotation.totalAmount,
        currency: quotation.currency || 'INR',
        quotationNumber: quotation.quotationNumber,
        clientName: quotation.clientName,
        clientEmail: quotation.clientEmail,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
