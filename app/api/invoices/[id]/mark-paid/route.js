import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Invoice from '@/models/Invoice';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();
    const { amount, paymentMethod, transactionId, paymentDate, notes } = body;
    
    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    if (amount > invoice.balanceAmount) {
      return NextResponse.json(
        { success: false, error: 'Payment amount exceeds balance due' },
        { status: 400 }
      );
    }

    // Add payment record
    invoice.payments.push({
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'cash',
      transactionId: transactionId || undefined,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      notes: notes || 'Manual payment recorded by admin',
    });

    // Update paid amount
    invoice.paidAmount = (invoice.paidAmount || 0) + parseFloat(amount);

    // The pre-save hook will automatically update paymentStatus and balanceAmount
    await invoice.save();

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      data: invoice,
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
