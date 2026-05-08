import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Invoice from '@/models/Invoice';
import crypto from 'crypto';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentMethod, amount } = body;
    
    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
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

    // Calculate payment amount (use balance amount if not provided)
    const paymentAmount = amount || invoice.balanceAmount || invoice.totalAmount;

    // Add payment record
    invoice.payments.push({
      amount: paymentAmount,
      paymentMethod: paymentMethod || 'online',
      transactionId: razorpay_payment_id,
      paymentDate: new Date(),
      notes: 'Online payment via Razorpay',
    });

    // Update paid amount
    invoice.paidAmount = (invoice.paidAmount || 0) + paymentAmount;

    // The pre-save hook will automatically update paymentStatus and balanceAmount
    await invoice.save();

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: invoice,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
