import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Invoice from '@/models/Invoice';
import Razorpay from 'razorpay';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if already paid
    if (invoice.paymentStatus === 'paid') {
      return NextResponse.json(
        { success: false, error: 'Invoice is already paid' },
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

    // Calculate amount to pay (balance amount if partially paid)
    const amountToPay = invoice.balanceAmount || invoice.totalAmount;

    // Create Razorpay order
    const options = {
      amount: Math.round(amountToPay * 100), // Amount in paise
      currency: invoice.currency || 'INR',
      receipt: invoice.invoiceNumber,
      notes: {
        invoiceId: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: amountToPay,
        currency: invoice.currency || 'INR',
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
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
