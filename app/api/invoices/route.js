import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Invoice from '@/models/Invoice';
import Quotation from '@/models/Quotation';
import Client from '@/models/Client';

// GET - Fetch all invoices
export async function GET(request) {
  try {
    await dbConnect();
    
    const invoices = await Invoice.find()
      .populate('client')
      .populate('quotation')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
