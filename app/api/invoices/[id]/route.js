import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Invoice from '@/models/Invoice';
import Quotation from '@/models/Quotation';
import Client from '@/models/Client';

// GET - Fetch single invoice
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const invoice = await Invoice.findById(id)
      .populate('client')
      .populate('quotation');
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
