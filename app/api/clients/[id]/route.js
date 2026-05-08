import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Client from '@/models/Client';

// GET - Fetch single client
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const client = await Client.findById(id);
    
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update client
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();
    
    const client = await Client.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: client,
      message: 'Client updated successfully',
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete client
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const client = await Client.findByIdAndDelete(id);
    
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
