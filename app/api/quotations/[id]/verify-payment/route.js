import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quotation from '@/models/Quotation';
import crypto from 'crypto';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentMethod } = body;
    
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update quotation with payment details
    quotation.razorpayPaymentId = razorpay_payment_id;
    quotation.razorpaySignature = razorpay_signature;
    quotation.paymentStatus = 'completed';
    quotation.paymentMethod = paymentMethod || 'online';
    quotation.paidAmount = quotation.totalAmount;
    quotation.paidAt = new Date();
    if (quotation.status !== 'accepted') {
      quotation.status = 'accepted';
      quotation.acceptedAt = new Date();
    }
    
    await quotation.save();

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: quotation,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
