import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  },
  quotation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  feedback: {
    type: String,
    required: false, // Made optional
  },
  testimonial: {
    type: String,
  },
  // Additional fields for detailed feedback
  categoryRatings: {
    type: Map,
    of: Number,
  },
  clientName: String,
  clientCompany: String,
  wouldRecommend: Boolean,
  isPublic: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  googleReviewSubmitted: {
    type: Boolean,
    default: false,
  },
  googleReviewUrl: String,
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
FeedbackSchema.index({ client: 1 });
FeedbackSchema.index({ service: 1 });
FeedbackSchema.index({ rating: 1 });
FeedbackSchema.index({ isPublic: 1, isApproved: 1 });
FeedbackSchema.index({ createdAt: -1 });

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
