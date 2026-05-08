import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quotation from '@/models/Quotation';

// GET - Fetch single quotation
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const quotation = await Quotation.findById(id).populate('client');
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: quotation,
    });
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update quotation
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();
    
    const quotation = await Quotation.findByIdAndUpdate(
      id,
      body,
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: quotation,
      message: 'Quotation updated successfully',
    });
  } catch (error) {
    console.error('Error updating quotation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete quotation
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const quotation = await Quotation.findByIdAndDelete(id);
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Quotation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
