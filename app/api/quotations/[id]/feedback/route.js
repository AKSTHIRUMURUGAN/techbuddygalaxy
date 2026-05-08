import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quotation from '@/models/Quotation';
import Feedback from '@/models/Feedback';

// POST - Submit feedback for quotation
export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();
    const { name, company, ratings, recommend, feedback, averageRating } = body;
    
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Create feedback with the correct field mapping
    const feedbackDoc = await Feedback.create({
      client: quotation.client,
      quotation: quotation._id,
      rating: averageRating || 0, // Use averageRating as the main rating
      feedback: feedback || '', // Comments/feedback text
      testimonial: recommend ? `${name} from ${company || 'their company'} would recommend Tech Buddy Galaxy` : '',
      categoryRatings: ratings, // Store individual category ratings
      clientName: name,
      clientCompany: company,
      wouldRecommend: recommend,
      isPublic: false,
      isApproved: false,
    });

    // Update quotation status if it was sent/viewed
    if (quotation.status === 'sent' || quotation.status === 'viewed') {
      quotation.status = recommend ? 'accepted' : 'rejected';
      if (recommend) {
        quotation.acceptedAt = new Date();
      } else {
        quotation.rejectedAt = new Date();
      }
      await quotation.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
      data: feedbackDoc,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET - Get feedback for quotation
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const feedback = await Feedback.find({ quotation: id })
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
