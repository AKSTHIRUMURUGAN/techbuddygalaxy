import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quotation from '@/models/Quotation';

// POST - Mark quotation as paid (for cash/UPI/bank transfer)
export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();
    const { paymentMethod, paymentNotes, paidAmount } = body;
    
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Update quotation with payment details
    quotation.paymentStatus = 'completed';
    quotation.paymentMethod = paymentMethod;
    quotation.paymentNotes = paymentNotes;
    quotation.paidAmount = paidAmount || quotation.totalAmount;
    quotation.paidAt = new Date();
    if (quotation.status !== 'accepted') {
      quotation.status = 'accepted';
      quotation.acceptedAt = new Date();
    }
    
    await quotation.save();

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      data: quotation,
    });
  } catch (error) {
    console.error('Error marking payment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
